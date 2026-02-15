"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Timeline from "@/components/Timeline";
import {
  getSongById,
  getBreakdown,
  saveBreakdown,
  deleteSong,
  loadSeedIfNeeded,
} from "@/lib/storage";
import { copySongExport } from "@/lib/export";
import { formatTime } from "@/lib/spotify";
import {
  nearestBeat,
  getCountForBeat,
  beatToMs,
  msToBeat,
  getTotalBeats,
  getStructureSegments,
} from "@/lib/beats";
import type { Song, Marker, Breakdown, CountChange, MarkerType } from "@/types";
import { MARKER_CONFIG, SECTION_LABELS } from "@/types";
import { SECTION_LABEL_COLORS } from "@/lib/sectionColors";

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const songId = params.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [bpm, setBpm] = useState(0);
  const [firstBeatMs, setFirstBeatMs] = useState(0);
  const [countChanges, setCountChanges] = useState<CountChange[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [playerDurationMs, setPlayerDurationMs] = useState(0);

  // UI state
  const [showCountPicker, setShowCountPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [bpmInput, setBpmInput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Seek ref so structure/counts can trigger seek from outside player
  const seekRef = useRef<((ms: number) => void) | null>(null);
  // Only re-render for beat/count when the beat index actually changes (smoother, no 60fps flood)
  const lastBeatRef = useRef<number>(-2);

  // Load song and breakdown
  useEffect(() => {
    async function load() {
      await loadSeedIfNeeded();
      const s = getSongById(songId);
      if (!s) {
        router.push("/catalog");
        return;
      }
      setSong(s);
      const bd = getBreakdown(s.id);
      if (bd) {
        setBpm(bd.bpm || 0);
        setFirstBeatMs(bd.firstBeatMs ?? 0);
        setCountChanges(bd.countChanges || []);
        setMarkers(bd.markers || []);
        setBpmInput(bd.bpm ? String(bd.bpm) : "");
      }
    }
    load();
  }, [songId, router]);

  // Reset beat ref when BPM/first beat changes so next position update commits
  useEffect(() => {
    lastBeatRef.current = -2;
  }, [bpm, firstBeatMs]);

  // Save breakdown whenever data changes
  useEffect(() => {
    if (!song) return;
    const bd: Breakdown = {
      songId: song.id,
      bpm,
      firstBeatMs,
      countChanges,
      markers,
      updatedAt: new Date().toISOString(),
    };
    saveBreakdown(bd);
  }, [bpm, firstBeatMs, countChanges, markers, song]);

  const handleTimeUpdate = useCallback(
    (ms: number) => {
      const beat = msToBeat(ms, bpm, firstBeatMs);
      if (beat !== lastBeatRef.current) {
        lastBeatRef.current = beat;
        setCurrentPositionMs(ms);
      }
    },
    [bpm, firstBeatMs]
  );

  const handleDuration = useCallback((ms: number) => {
    setPlayerDurationMs(ms);
  }, []);

  // BPM handling
  const handleBpmChange = useCallback((value: string) => {
    setBpmInput(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num < 300) {
      setBpm(num);
    }
  }, []);

  // Set first beat at current position
  const handleSetFirstBeat = useCallback(() => {
    setFirstBeatMs(currentPositionMs);
  }, [currentPositionMs]);

  // Current beat info
  const durationMs = playerDurationMs || song?.durationMs || 0;
  const totalBeats = useMemo(
    () => getTotalBeats(durationMs, bpm, firstBeatMs),
    [durationMs, bpm, firstBeatMs]
  );
  const sectionMarkers = useMemo(
    () => markers.filter((m) => m.type === "section"),
    [markers]
  );
  const structureSegments = useMemo(
    () =>
      getStructureSegments(
        totalBeats,
        sectionMarkers.map((m) => ({ beatIndex: m.beatIndex, label: m.label }))
      ),
    [totalBeats, sectionMarkers]
  );
  const currentBeat = useMemo(() => {
    if (bpm <= 0 || currentPositionMs < firstBeatMs) return -1;
    return msToBeat(currentPositionMs, bpm, firstBeatMs);
  }, [currentPositionMs, bpm, firstBeatMs]);

  const currentCount = useMemo(() => {
    if (currentBeat < 0) return 0;
    return getCountForBeat(currentBeat, countChanges);
  }, [currentBeat, countChanges]);

  // Add count change at current beat
  const addCountChange = useCallback(
    (resetTo: number) => {
      const beat = nearestBeat(currentPositionMs, bpm, firstBeatMs);
      if (beat < 0 || bpm <= 0) return;

      const existing = countChanges.find((cc) => cc.beatIndex === beat);
      if (existing) {
        setCountChanges((prev) =>
          prev
            .map((cc) => (cc.id === existing.id ? { ...cc, resetTo } : cc))
            .sort((a, b) => a.beatIndex - b.beatIndex)
        );
      } else {
        const cc: CountChange = {
          id: uuidv4(),
          beatIndex: beat,
          resetTo,
        };
        setCountChanges((prev) =>
          [...prev, cc].sort((a, b) => a.beatIndex - b.beatIndex)
        );
      }
      setShowCountPicker(false);
    },
    [currentPositionMs, bpm, firstBeatMs, countChanges]
  );

  // Add section marker at current beat
  const addSection = useCallback(
    (label: string) => {
      const beat = nearestBeat(currentPositionMs, bpm, firstBeatMs);
      if (beat < 0 || bpm <= 0) return;
      const marker: Marker = {
        id: uuidv4(),
        beatIndex: beat,
        type: "section",
        label,
      };
      setMarkers((prev) =>
        [...prev, marker].sort((a, b) => a.beatIndex - b.beatIndex)
      );
      setShowSectionPicker(false);
    },
    [currentPositionMs, bpm, firstBeatMs]
  );

  // Add break/accent at current beat
  const addMarkerQuick = useCallback(
    (type: MarkerType) => {
      const beat = nearestBeat(currentPositionMs, bpm, firstBeatMs);
      if (beat < 0 || bpm <= 0) return;
      const marker: Marker = {
        id: uuidv4(),
        beatIndex: beat,
        type,
      };
      setMarkers((prev) =>
        [...prev, marker].sort((a, b) => a.beatIndex - b.beatIndex)
      );
    },
    [currentPositionMs, bpm, firstBeatMs]
  );

  // Delete handlers
  const deleteCountChange = useCallback((id: string) => {
    setCountChanges((prev) => prev.filter((cc) => cc.id !== id));
  }, []);

  const deleteMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleDeleteSong = () => {
    if (!song) return;
    if (window.confirm(`Delete "${song.title}"?`)) {
      deleteSong(song.id);
      router.push("/catalog");
    }
  };

  // Close pickers on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCountPicker(false);
        setShowSectionPicker(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close pickers when clicking outside
  useEffect(() => {
    if (!showCountPicker && !showSectionPicker) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-picker]")) {
        setShowCountPicker(false);
        setShowSectionPicker(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handler);
    };
  }, [showCountPicker, showSectionPicker]);

  if (!song) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header />

      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-8">
        {/* Song info header */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
          {song.albumArt ? (
            <Image
              src={song.albumArt}
              alt={song.title}
              width={56}
              height={56}
              className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xl">
              🎵
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-white truncate">
              {song.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 truncate">
              {song.artist}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {bpm > 0 && (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-300">
                  {Math.round(bpm)} bpm
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">
                {formatTime(durationMs)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <button
              onClick={async () => {
                const ok = await copySongExport(song.id);
                if (ok) {
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }
              }}
              className="rounded-lg border border-zinc-700 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {copySuccess ? "Copied!" : "Copy JSON"}
            </button>
            <button
              onClick={handleDeleteSong}
              className="rounded-lg border border-red-900/50 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-red-400/70 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Structure card: SONG STRUCTURE, RHYTHM, PHRASING, BEATS / COUNTS */}
        <div className="mb-4 sm:mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-5 space-y-5 sm:space-y-6">
          {/* SONG STRUCTURE */}
          <div className="space-y-2">
            <h2 className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">
              Song structure
            </h2>
            {totalBeats > 0 ? (
              <>
                <div className="w-full overflow-x-auto overflow-y-hidden pb-1">
                  <div className="flex h-8 sm:h-10 gap-0.5 w-full min-w-0">
                    {structureSegments.map((seg, i) => {
                      const beatSpan = Math.max(1, seg.endBeat - seg.startBeat);
                      const isCurrent =
                        bpm > 0 &&
                        currentBeat >= seg.startBeat &&
                        currentBeat < seg.endBeat;
                      const color = seg.label && SECTION_LABEL_COLORS[seg.label.toLowerCase()]
                        ? SECTION_LABEL_COLORS[seg.label.toLowerCase()]
                        : "rgb(63 63 70)"; // zinc-700
                      const canSeek = bpm > 0 && firstBeatMs >= 0;
                      return (
                        <button
                          type="button"
                          key={`${seg.startBeat}-${seg.endBeat}-${i}`}
                          className={`rounded-md min-w-[6px] transition-all ${
                            canSeek ? "cursor-pointer hover:opacity-90" : "cursor-default"
                          } ${isCurrent ? "ring-2 ring-white/80 ring-offset-1 ring-offset-zinc-900 shadow-lg" : ""}`}
                          style={{
                            flex: `${beatSpan} 1 0`,
                            backgroundColor: color,
                          }}
                          title={seg.label ? `${seg.label} (beats ${seg.startBeat}–${seg.endBeat})` : `Eight ${Math.floor(seg.startBeat / 8) + 1}`}
                          disabled={!canSeek}
                          onClick={() => {
                            if (canSeek && seekRef.current) {
                              seekRef.current(beatToMs(seg.startBeat, bpm, firstBeatMs));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {SECTION_LABELS.map((label) => {
                    const color = SECTION_LABEL_COLORS[label] ?? "rgb(113 113 122)";
                    return (
                      <span
                        key={label}
                        className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-medium capitalize"
                        style={{ backgroundColor: `${color}30`, color }}
                      >
                        {label.replace("-", " ")}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-xs text-zinc-500 py-2">
                Set BPM and first beat to see structure (breakdown by 8-count)
              </p>
            )}
          </div>

          {/* RHYTHM / FRAMEWORK */}
          <div className="space-y-1">
            <h2 className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">
              Rhythm / framework
            </h2>
            <p className="text-center text-lg sm:text-xl font-bold text-zinc-300">
              {bpm > 0 ? "Derecho" : "—"}
            </p>
          </div>

          {/* SECTION PHRASING (2 and 4 count) */}
          <div className="space-y-2">
            <h2 className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">
              Section phrasing
            </h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-1.5">
                {[1, 2].map((n) => {
                  const active = currentCount > 0 && ((currentCount - 1) >> 1) + 1 === n;
                  const canSeek = bpm > 0 && firstBeatMs >= 0;
                  const baseEight = currentBeat < 0 ? 0 : Math.floor(currentBeat / 8) * 8;
                  const targetBeat = baseEight + (n - 1) * 4;
                  return (
                    <button
                      type="button"
                      key={n}
                      className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                        canSeek ? "cursor-pointer hover:opacity-90" : "cursor-default"
                      } ${
                        active ? "border-emerald-400 bg-emerald-500/30 text-emerald-300" : "border-zinc-600 bg-transparent text-zinc-500"
                      }`}
                      disabled={!canSeek}
                      onClick={() => {
                        if (canSeek && seekRef.current) {
                          seekRef.current(beatToMs(targetBeat, bpm, firstBeatMs));
                        }
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-1.5">
                {[1, 2, 3, 4].map((n) => {
                  const active = currentCount > 0 && ((currentCount - 1) >> 2) + 1 === n;
                  const canSeek = bpm > 0 && firstBeatMs >= 0;
                  const baseEight = currentBeat < 0 ? 0 : Math.floor(currentBeat / 8) * 8;
                  const targetBeat = baseEight + (n - 1) * 2;
                  return (
                    <button
                      type="button"
                      key={n}
                      className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                        canSeek ? "cursor-pointer hover:opacity-90" : "cursor-default"
                      } ${
                        active ? "border-emerald-400 bg-emerald-500/30 text-emerald-300" : "border-zinc-600 bg-transparent text-zinc-500"
                      }`}
                      disabled={!canSeek}
                      onClick={() => {
                        if (canSeek && seekRef.current) {
                          seekRef.current(beatToMs(targetBeat, bpm, firstBeatMs));
                        }
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BEATS / COUNTS — always show 8-count breakdown */}
          <div className="space-y-2">
            <h2 className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500">
              Beats / counts
            </h2>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-2">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => {
                  const canSeek = bpm > 0 && firstBeatMs >= 0;
                  const baseEight = currentBeat < 0 ? 0 : Math.floor(currentBeat / 8) * 8;
                  const targetBeat = baseEight + (num - 1);
                  return (
                    <button
                      type="button"
                      key={num}
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-sm sm:text-base font-bold transition-all ${
                        canSeek ? "cursor-pointer hover:opacity-90" : "cursor-default"
                      } ${
                        currentCount === num
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                          : "border-2 border-zinc-600 bg-zinc-800/80 text-zinc-500"
                      }`}
                      disabled={!canSeek}
                      onClick={() => {
                        if (canSeek && seekRef.current) {
                          seekRef.current(beatToMs(targetBeat, bpm, firstBeatMs));
                        }
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
            {bpm <= 0 && (
              <p className="text-center text-[10px] text-zinc-500">
                Set BPM and first beat to sync counts
              </p>
            )}
          </div>
        </div>

        {/* Player + controls */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-5">
          <SpotifyPlayer
            spotifyUri={`spotify:track:${song.spotifyId}`}
            onTimeUpdate={handleTimeUpdate}
            onDuration={handleDuration}
          >
            {(controls) => {
              seekRef.current = controls.seek;
              return (
              <div className="space-y-3 sm:space-y-4">
                {/* BPM config row */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
                    <input
                      type="number"
                      value={bpmInput}
                      onChange={(e) => handleBpmChange(e.target.value)}
                      placeholder="BPM"
                      min={30}
                      max={250}
                      className="w-14 sm:w-16 bg-transparent px-2 sm:px-2.5 py-1.5 text-sm text-white placeholder-zinc-500 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="pr-1.5 sm:pr-2 text-[10px] text-zinc-500">
                      BPM
                    </span>
                  </div>

                  <button
                    onClick={handleSetFirstBeat}
                    className={`rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs transition-colors active:bg-zinc-600 ${
                      firstBeatMs > 0
                        ? "border-white/20 text-white bg-zinc-700"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    Set 1
                  </button>

                  {firstBeatMs > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      @ {formatTime(firstBeatMs)}
                    </span>
                  )}
                </div>

                {/* Play controls */}
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {/* Restart (seek to 0:00) */}
                  <button
                    onClick={() => controls.seek(0)}
                    className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors active:bg-zinc-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="4" y="5" width="2.5" height="14" rx="0.5" />
                      <path d="M9 12l9-7v14l-9-7z" />
                    </svg>
                  </button>

                  {/* Go to beat 1 — only if firstBeatMs > 0 */}
                  {firstBeatMs > 0 && (
                    <button
                      onClick={() => controls.seek(firstBeatMs)}
                      className="rounded-lg border border-amber-500/30 px-2 py-1.5 text-[10px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors active:bg-amber-500/20"
                    >
                      ♩1
                    </button>
                  )}

                  {/* Back 5s */}
                  <button
                    onClick={() =>
                      controls.seek(Math.max(0, controls.positionMs - 5000))
                    }
                    className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                      />
                    </svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={controls.togglePlay}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-black hover:scale-105 hover:bg-zinc-200 transition-all"
                  >
                    {controls.isPlaying ? (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Forward 5s */}
                  <button
                    onClick={() =>
                      controls.seek(
                        Math.min(controls.durationMs, controls.positionMs + 5000)
                      )
                    }
                    className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Timeline */}
                <Timeline
                  durationMs={durationMs}
                  positionMs={controls.positionMs}
                  bpm={bpm}
                  firstBeatMs={firstBeatMs}
                  countChanges={countChanges}
                  markers={markers}
                  onSeek={controls.seek}
                />

                {/* Action buttons */}
                {bpm > 0 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Count change */}
                    <div className="relative" data-picker>
                      <button
                        onClick={() => {
                          setShowCountPicker(!showCountPicker);
                          setShowSectionPicker(false);
                        }}
                        className="rounded-lg border border-zinc-700 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        + Count
                      </button>
                      {showCountPicker && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-0.5 sm:gap-1 rounded-lg border border-zinc-700 bg-zinc-800 p-1 sm:p-1.5 shadow-xl z-50">
                          {Array.from({ length: 8 }, (_, i) => i + 1).map(
                            (num) => (
                              <button
                                key={num}
                                onClick={() => addCountChange(num)}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-zinc-300 hover:bg-white hover:text-black transition-colors active:bg-zinc-200"
                              >
                                {num}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Section */}
                    <div className="relative" data-picker>
                      <button
                        onClick={() => {
                          setShowSectionPicker(!showSectionPicker);
                          setShowCountPicker(false);
                        }}
                        className="rounded-lg border border-zinc-700 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        + Section
                      </button>
                      {showSectionPicker && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-wrap justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 shadow-xl z-50 min-w-[200px]">
                          {SECTION_LABELS.map((label) => (
                            <button
                              key={label}
                              onClick={() => addSection(label)}
                              className="rounded-md px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors capitalize active:bg-emerald-500/30"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Break */}
                    <button
                      onClick={() => addMarkerQuick("break")}
                      className="rounded-lg border border-zinc-700 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors active:bg-zinc-600"
                    >
                      + Break
                    </button>

                    {/* Accent */}
                    <button
                      onClick={() => addMarkerQuick("accent")}
                      className="rounded-lg border border-zinc-700 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors active:bg-zinc-600"
                    >
                      + Accent
                    </button>
                  </div>
                )}
              </div>
            );
            }}
          </SpotifyPlayer>
        </div>

        {/* Breakdown list */}
        {(countChanges.length > 0 || markers.length > 0) && (
          <div className="mt-4 sm:mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-5">
            <div className="space-y-0.5 max-h-[50vh] sm:max-h-[400px] overflow-y-auto">
              {[
                ...countChanges.map((cc) => ({
                  key: cc.id,
                  beatIndex: cc.beatIndex,
                  kind: "countChange" as const,
                  data: cc,
                })),
                ...markers.map((m) => ({
                  key: m.id,
                  beatIndex: m.beatIndex,
                  kind: "marker" as const,
                  data: m,
                })),
              ]
                .sort((a, b) => a.beatIndex - b.beatIndex)
                .map((item) => {
                  const ms = beatToMs(item.beatIndex, bpm, firstBeatMs);

                  if (item.kind === "countChange") {
                    const cc = item.data as CountChange;
                    return (
                      <div
                        key={item.key}
                        className="group flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rounded-full bg-amber-400" />
                        <span className="w-10 sm:w-12 shrink-0 font-mono text-[10px] sm:text-xs text-zinc-500">
                          {formatTime(ms)}
                        </span>
                        <span className="text-xs sm:text-sm text-zinc-300">
                          Count → {cc.resetTo}
                        </span>
                        <div className="flex-1" />
                        <button
                          onClick={() => deleteCountChange(cc.id)}
                          className="rounded p-1.5 text-zinc-600 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-900/20 hover:text-red-400 transition-all"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  }

                  const marker = item.data as Marker;
                  const cfg = MARKER_CONFIG[marker.type];
                  return (
                    <div
                      key={item.key}
                      className="group flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div
                        className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span className="w-10 sm:w-12 shrink-0 font-mono text-[10px] sm:text-xs text-zinc-500">
                        {formatTime(ms)}
                      </span>
                      <span className="text-xs sm:text-sm text-zinc-300">
                        {cfg.label}
                      </span>
                      {marker.label && (
                        <span className="rounded-full bg-zinc-800 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-zinc-400">
                          {marker.label}
                        </span>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => deleteMarker(marker.id)}
                        className="rounded p-1.5 text-zinc-600 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-900/20 hover:text-red-400 transition-all"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

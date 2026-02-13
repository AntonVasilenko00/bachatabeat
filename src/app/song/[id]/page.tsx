"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Timeline from "@/components/Timeline";
import MarkerEditor from "@/components/MarkerEditor";
import {
  getSongById,
  getBreakdown,
  saveBreakdown,
  deleteSong,
  loadSeedIfNeeded,
} from "@/lib/storage";
import { exportSong } from "@/lib/export";
import { formatTime } from "@/lib/spotify";
import type { Song, Marker, Breakdown, MarkerType } from "@/types";
import { MARKER_CONFIG } from "@/types";

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const songId = params.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTimeMs, setEditorTimeMs] = useState(0);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [playerDurationMs, setPlayerDurationMs] = useState(0);

  // Load song and breakdown from localStorage
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
      if (bd) setMarkers(bd.markers);
    }
    load();
  }, [songId, router]);

  // Save breakdown whenever markers change
  useEffect(() => {
    if (!song) return;
    const bd: Breakdown = {
      songId: song.id,
      markers,
      updatedAt: new Date().toISOString(),
    };
    saveBreakdown(bd);
  }, [markers, song]);

  const handleTimeUpdate = useCallback((ms: number) => {
    setCurrentPositionMs(ms);
  }, []);

  const handleDuration = useCallback((ms: number) => {
    setPlayerDurationMs(ms);
  }, []);

  // Open marker editor at a specific time
  const openEditor = useCallback((ms: number) => {
    setEditorTimeMs(ms);
    setEditorOpen(true);
  }, []);

  // Add marker
  const addMarker = useCallback(
    (type: MarkerType, label?: string) => {
      const marker: Marker = {
        id: uuidv4(),
        timeMs: editorTimeMs,
        type,
        label,
      };
      setMarkers((prev) =>
        [...prev, marker].sort((a, b) => a.timeMs - b.timeMs)
      );
      setEditorOpen(false);
    },
    [editorTimeMs]
  );

  // Delete marker
  const deleteMarker = useCallback((markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Number keys 1-5: quick-add marker at current position
      const shortcutTypes: Record<string, MarkerType> = {
        "1": "count",
        "2": "break",
        "3": "accent",
        "4": "rhythmChange",
        "5": "section",
      };

      if (shortcutTypes[e.key] && !editorOpen) {
        const type = shortcutTypes[e.key];
        if (type === "section" || type === "count") {
          // Open editor for types that need labels
          openEditor(currentPositionMs);
        } else {
          // Quick-add without label
          const marker: Marker = {
            id: uuidv4(),
            timeMs: currentPositionMs,
            type,
          };
          setMarkers((prev) =>
            [...prev, marker].sort((a, b) => a.timeMs - b.timeMs)
          );
        }
      }

      // Escape to close editor
      if (e.key === "Escape" && editorOpen) {
        setEditorOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editorOpen, currentPositionMs, openEditor]);

  const handleDeleteSong = () => {
    if (!song) return;
    if (window.confirm(`Delete "${song.title}" and all its markers?`)) {
      deleteSong(song.id);
      router.push("/catalog");
    }
  };

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

  const durationMs = playerDurationMs || song.durationMs;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Song info header */}
        <div className="mb-8 flex items-start gap-4">
          {song.albumArt ? (
            <Image
              src={song.albumArt}
              alt={song.title}
              width={96}
              height={96}
              className="h-24 w-24 shrink-0 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-3xl">
              🎵
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="mb-1 text-2xl font-bold text-white truncate">
              {song.title}
            </h1>
            <p className="text-zinc-400">{song.artist}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatTime(song.durationMs)} &middot; {markers.length} marker
              {markers.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => exportSong(song.id)}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Export JSON
            </button>
            <button
              onClick={handleDeleteSong}
              className="rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Player + Timeline */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <SpotifyPlayer
            spotifyUri={`spotify:track:${song.spotifyId}`}
            onTimeUpdate={handleTimeUpdate}
            onDuration={handleDuration}
          >
            {(controls) => (
              <div className="space-y-4">
                {/* Play controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      controls.seek(
                        Math.max(0, controls.positionMs - 5000)
                      )
                    }
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800"
                    title="Back 5s"
                  >
                    <svg
                      className="h-5 w-5"
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

                  <button
                    onClick={controls.togglePlay}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 hover:bg-zinc-200"
                  >
                    {controls.isPlaying ? (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      controls.seek(
                        Math.min(
                          controls.durationMs,
                          controls.positionMs + 5000
                        )
                      )
                    }
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800"
                    title="Forward 5s"
                  >
                    <svg
                      className="h-5 w-5"
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
                  markers={markers}
                  onSeek={controls.seek}
                  onClickTimeline={openEditor}
                  isPlaying={controls.isPlaying}
                />

                {/* Quick-add button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => openEditor(controls.positionMs)}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    + Add marker at {formatTime(controls.positionMs)}
                  </button>
                </div>
              </div>
            )}
          </SpotifyPlayer>
        </div>

        {/* Marker list */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Breakdown
            </h2>
            <span className="text-xs text-zinc-500">
              {markers.length} marker{markers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {markers.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No markers yet. Play the song and add markers to annotate
              the structure.
              <br />
              <span className="text-xs text-zinc-600">
                Use keyboard shortcuts 1-5 or double-click the timeline.
              </span>
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {markers.map((marker) => {
                const cfg = MARKER_CONFIG[marker.type];
                return (
                  <div
                    key={marker.id}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800/50"
                  >
                    {/* Color dot */}
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />

                    {/* Time */}
                    <span className="w-14 shrink-0 font-mono text-xs text-zinc-400">
                      {formatTime(marker.timeMs)}
                    </span>

                    {/* Type */}
                    <span className="text-sm text-zinc-200">
                      {cfg.label}
                    </span>

                    {/* Label */}
                    {marker.label && (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {marker.label}
                      </span>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Delete */}
                    <button
                      onClick={() => deleteMarker(marker.id)}
                      className="rounded p-1 text-zinc-600 opacity-0 transition-all hover:bg-red-900/20 hover:text-red-400 group-hover:opacity-100"
                      title="Delete marker"
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
          )}
        </div>
      </main>

      {/* Marker editor modal */}
      {editorOpen && (
        <MarkerEditor
          timeMs={editorTimeMs}
          onAdd={addMarker}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

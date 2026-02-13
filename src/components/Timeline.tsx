"use client";

import { useRef, useCallback, useMemo } from "react";
import type { Marker, CountChange } from "@/types";
import { MARKER_CONFIG } from "@/types";
import { formatTime } from "@/lib/spotify";
import {
  beatToMs,
  getTotalBeats,
  getCountForBeat,
} from "@/lib/beats";

interface TimelineProps {
  durationMs: number;
  positionMs: number;
  bpm: number;
  firstBeatMs: number;
  countChanges: CountChange[];
  markers: Marker[];
  onSeek: (ms: number) => void;
}

export default function Timeline({
  durationMs,
  positionMs,
  bpm,
  firstBeatMs,
  countChanges,
  markers,
  onSeek,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const getMsFromClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || durationMs === 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      return Math.round(pct * durationMs);
    },
    [durationMs]
  );

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onSeek(getMsFromClick(e));
    },
    [getMsFromClick, onSeek]
  );

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const totalBeats = getTotalBeats(durationMs, bpm, firstBeatMs);

  // Determine which beat ticks to render (limit density for performance)
  const beatTicks = useMemo(() => {
    if (bpm <= 0 || totalBeats <= 0) return [];
    const ticks: { beatIndex: number; pct: number; isOne: boolean }[] = [];
    // Only render beats that would be at least ~3px apart
    const barWidthEstimate = 800; // approximate
    const minSpacing = 3;
    const step = Math.max(
      1,
      Math.ceil(totalBeats / (barWidthEstimate / minSpacing))
    );

    for (let i = 0; i < totalBeats; i += step) {
      const ms = beatToMs(i, bpm, firstBeatMs);
      const pct = (ms / durationMs) * 100;
      const count = getCountForBeat(i, countChanges);
      ticks.push({ beatIndex: i, pct, isOne: count === 1 });
    }
    return ticks;
  }, [bpm, firstBeatMs, totalBeats, durationMs, countChanges]);

  // Count change positions on the bar
  const countChangePositions = useMemo(() => {
    return countChanges.map((cc) => {
      const ms = beatToMs(cc.beatIndex, bpm, firstBeatMs);
      return { ...cc, pct: (ms / durationMs) * 100, ms };
    });
  }, [countChanges, bpm, firstBeatMs, durationMs]);

  // Marker positions on the bar
  const markerPositions = useMemo(() => {
    return markers.map((m) => {
      const ms = beatToMs(m.beatIndex, bpm, firstBeatMs);
      return { ...m, pct: (ms / durationMs) * 100, ms };
    });
  }, [markers, bpm, firstBeatMs, durationMs]);

  return (
    <div className="w-full space-y-2">
      {/* Time display */}
      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>{formatTime(positionMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>

      {/* Timeline bar */}
      <div
        ref={barRef}
        className="group relative h-14 cursor-pointer rounded-lg bg-zinc-800 overflow-hidden select-none"
        onClick={handleBarClick}
      >
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-zinc-700/40 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* Beat tick marks */}
        {beatTicks.map((tick) => (
          <div
            key={tick.beatIndex}
            className="absolute top-0 bottom-0 z-[5]"
            style={{ left: `${tick.pct}%` }}
          >
            <div
              className={`w-px h-full ${
                tick.isOne
                  ? "bg-zinc-500/50"
                  : "bg-zinc-600/25"
              }`}
            />
          </div>
        ))}

        {/* Count change markers */}
        {countChangePositions.map((cc) => (
          <div
            key={cc.id}
            className="absolute top-0 bottom-0 z-[12]"
            style={{ left: `${cc.pct}%` }}
          >
            <div className="w-0.5 h-full bg-amber-400/80" />
            <div className="absolute top-0.5 left-1 text-[9px] font-bold text-amber-400 pointer-events-none">
              {cc.resetTo}
            </div>
          </div>
        ))}

        {/* Section/break/accent markers */}
        {markerPositions.map((m) => {
          const cfg = MARKER_CONFIG[m.type];
          return (
            <div
              key={m.id}
              className="absolute top-0 bottom-0 z-[11]"
              style={{ left: `${m.pct}%` }}
            >
              <div
                className="w-0.5 h-full opacity-80"
                style={{ backgroundColor: cfg.color }}
              />
              {m.label && (
                <div
                  className="absolute bottom-0.5 left-1 text-[9px] font-medium uppercase tracking-wide pointer-events-none whitespace-nowrap"
                  style={{ color: cfg.color }}
                >
                  {m.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 transition-[left] duration-100"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow" />
        </div>
      </div>
    </div>
  );
}

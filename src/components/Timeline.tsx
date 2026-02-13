"use client";

import { useRef, useCallback } from "react";
import type { Marker, MarkerType } from "@/types";
import { MARKER_CONFIG } from "@/types";
import { formatTime } from "@/lib/spotify";

interface TimelineProps {
  durationMs: number;
  positionMs: number;
  markers: Marker[];
  onSeek: (ms: number) => void;
  onClickTimeline?: (ms: number) => void;
  isPlaying: boolean;
}

export default function Timeline({
  durationMs,
  positionMs,
  markers,
  onSeek,
  onClickTimeline,
  isPlaying,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const getTimeFromClick = useCallback(
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
      const ms = getTimeFromClick(e);
      onSeek(ms);
    },
    [getTimeFromClick, onSeek]
  );

  const handleBarDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const ms = getTimeFromClick(e);
      onClickTimeline?.(ms);
    },
    [getTimeFromClick, onClickTimeline]
  );

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      {/* Time display */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>{formatTime(positionMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>

      {/* Timeline bar */}
      <div
        ref={barRef}
        className="group relative h-12 cursor-pointer rounded-lg bg-zinc-800 overflow-hidden select-none"
        onClick={handleBarClick}
        onDoubleClick={handleBarDoubleClick}
      >
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-zinc-700/50 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 transition-[left] duration-100"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow" />
        </div>

        {/* Markers */}
        {markers.map((marker) => {
          const pct =
            durationMs > 0 ? (marker.timeMs / durationMs) * 100 : 0;
          const config = MARKER_CONFIG[marker.type];

          return (
            <div
              key={marker.id}
              className="absolute top-0 bottom-0 z-10 group/marker"
              style={{ left: `${pct}%` }}
              title={`${config.label}${marker.label ? `: ${marker.label}` : ""} @ ${formatTime(marker.timeMs)}`}
            >
              {/* Marker line */}
              <div
                className="w-0.5 h-full opacity-80 hover:opacity-100"
                style={{ backgroundColor: config.color }}
              />
              {/* Marker dot */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-90 hover:scale-150 transition-transform"
                style={{ backgroundColor: config.color }}
              />
            </div>
          );
        })}

        {/* Section labels along the bottom */}
        {markers
          .filter((m) => m.type === "section" && m.label)
          .map((marker) => {
            const pct =
              durationMs > 0 ? (marker.timeMs / durationMs) * 100 : 0;
            return (
              <div
                key={`label-${marker.id}`}
                className="absolute bottom-0.5 z-10 text-[9px] font-medium text-emerald-300/80 uppercase tracking-wide pointer-events-none"
                style={{ left: `${pct + 0.5}%` }}
              >
                {marker.label}
              </div>
            );
          })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
        {(Object.entries(MARKER_CONFIG) as [MarkerType, typeof MARKER_CONFIG[MarkerType]][]).map(
          ([type, cfg]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              <span>{cfg.label}</span>
              <kbd className="ml-0.5 rounded bg-zinc-800 px-1 py-0.5 text-[9px] text-zinc-500 font-mono">
                {cfg.shortcut}
              </kbd>
            </div>
          )
        )}
        <div className="text-zinc-600 ml-auto">
          Click to seek &middot; Double-click to add marker
        </div>
      </div>
    </div>
  );
}

import type { Song, Breakdown, SongExport } from "@/types";
import { getSongs, getAllBreakdowns, getBreakdown } from "./storage";

/** Export a single song + its breakdown to a JSON download */
export function exportSong(songId: string): void {
  const songs = getSongs();
  const song = songs.find((s) => s.id === songId);
  if (!song) return;

  const breakdown = getBreakdown(songId) ?? {
    songId,
    markers: [],
    updatedAt: new Date().toISOString(),
  };

  const data: SongExport = { song, breakdown };
  downloadJson(data, `bachatabeat-${slugify(song.title)}.json`);
}

/** Export all songs + breakdowns to a single JSON download */
export function exportAll(): void {
  const songs = getSongs();
  const breakdowns = getAllBreakdowns();

  const data: SongExport[] = songs.map((song) => ({
    song,
    breakdown: breakdowns[song.id] ?? {
      songId: song.id,
      markers: [],
      updatedAt: new Date().toISOString(),
    },
  }));

  downloadJson(data, `bachatabeat-export-${dateStamp()}.json`);
}

// ── Helpers ─────────────────────────────────────────────────────────────

function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

import type { SongExport } from "@/types";
import { getSongs, getAllBreakdowns, getBreakdown } from "./storage";

/** Build song + breakdown as SongExport (for copy or download). */
export function getSongExport(songId: string): SongExport | null {
  const songs = getSongs();
  const song = songs.find((s) => s.id === songId);
  if (!song) return null;

  const breakdown = getBreakdown(songId) ?? {
    songId,
    bpm: 0,
    firstBeatMs: 0,
    countChanges: [],
    markers: [],
    updatedAt: new Date().toISOString(),
  };

  return { song, breakdown };
}

/** Copy a single song + its breakdown as JSON to the clipboard. Returns true on success. */
export async function copySongExport(songId: string): Promise<boolean> {
  const data = getSongExport(songId);
  if (!data) return false;
  const json = JSON.stringify(data, null, 2);
  await navigator.clipboard.writeText(json);
  return true;
}

/** Export all songs + breakdowns to a single JSON download */
export function exportAll(): void {
  const songs = getSongs();
  const breakdowns = getAllBreakdowns();

  const data: SongExport[] = songs.map((song) => ({
    song,
    breakdown: breakdowns[song.id] ?? {
      songId: song.id,
      bpm: 0,
      firstBeatMs: 0,
      countChanges: [],
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

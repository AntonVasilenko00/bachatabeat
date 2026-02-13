import type { Song, Breakdown, SongExport } from "@/types";

const SONGS_KEY = "bachatabeat:songs";
const BREAKDOWNS_KEY = "bachatabeat:breakdowns";

// ── Songs ───────────────────────────────────────────────────────────────

export function getSongs(): Song[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SONGS_KEY);
    return raw ? (JSON.parse(raw) as Song[]) : [];
  } catch {
    return [];
  }
}

export function saveSong(song: Song): void {
  const songs = getSongs();
  const idx = songs.findIndex((s) => s.spotifyId === song.spotifyId);
  if (idx >= 0) {
    songs[idx] = song;
  } else {
    songs.push(song);
  }
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function getSongById(id: string): Song | undefined {
  return getSongs().find((s) => s.id === id || s.spotifyId === id);
}

export function deleteSong(id: string): void {
  const songs = getSongs().filter((s) => s.id !== id);
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  // Also remove breakdown
  const breakdowns = getAllBreakdowns();
  delete breakdowns[id];
  localStorage.setItem(BREAKDOWNS_KEY, JSON.stringify(breakdowns));
}

// ── Breakdowns ──────────────────────────────────────────────────────────

export function getAllBreakdowns(): Record<string, Breakdown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BREAKDOWNS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Breakdown>) : {};
  } catch {
    return {};
  }
}

export function getBreakdown(songId: string): Breakdown | undefined {
  return getAllBreakdowns()[songId];
}

export function saveBreakdown(breakdown: Breakdown): void {
  const all = getAllBreakdowns();
  all[breakdown.songId] = breakdown;
  localStorage.setItem(BREAKDOWNS_KEY, JSON.stringify(all));
}

// ── Seed data loading ───────────────────────────────────────────────────

let seedLoaded = false;

export async function loadSeedIfNeeded(): Promise<void> {
  if (seedLoaded || typeof window === "undefined") return;
  seedLoaded = true;

  // Only load seed if localStorage is empty
  if (getSongs().length > 0) return;

  try {
    const res = await fetch("/seed/songs.json");
    if (!res.ok) return;
    const data = (await res.json()) as SongExport[];

    const songs = getSongs();
    const breakdowns = getAllBreakdowns();

    for (const entry of data) {
      if (!songs.find((s) => s.spotifyId === entry.song.spotifyId)) {
        songs.push(entry.song);
        breakdowns[entry.song.id] = entry.breakdown;
      }
    }

    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    localStorage.setItem(BREAKDOWNS_KEY, JSON.stringify(breakdowns));
  } catch {
    // Seed file may not exist — that's fine
  }
}

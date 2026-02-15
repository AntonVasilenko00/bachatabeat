// ── Count change: resets the count at a specific beat ────────────────

export interface CountChange {
  id: string;
  beatIndex: number;
  resetTo: number; // 1–8
}

// ── Marker types (linked to beats) ──────────────────────────────────

export type MarkerType = "section" | "break" | "accent";

export interface Marker {
  id: string;
  beatIndex: number;
  type: MarkerType;
  label?: string;
}

// ── Song metadata (from Spotify) ────────────────────────────────────

export interface Song {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  addedAt: string;
}

// ── Breakdown (BPM-based annotations for a song) ────────────────────

export interface Breakdown {
  songId: string;
  bpm: number;
  firstBeatMs: number;
  countChanges: CountChange[];
  markers: Marker[];
  updatedAt: string;
}

// ── Export format ────────────────────────────────────────────────────

export interface SongExport {
  song: Song;
  breakdown: Breakdown;
}

// ── Marker display config ───────────────────────────────────────────

export const MARKER_CONFIG: Record<MarkerType, { label: string; color: string }> = {
  section: { label: "Section", color: "#10B981" },
  break: { label: "Break", color: "#EF4444" },
  accent: { label: "Accent", color: "#F59E0B" },
};

export const SECTION_LABELS = [
  "intro",
  "verse",
  "pre-chorus",
  "chorus",
  "mambo",
  "bridge",
  "outro",
] as const;

/** Colors for song structure blocks (by section label) */
export const SECTION_LABEL_COLORS: Record<string, string> = {
  intro: "#7DD3FC",      // light blue
  verse: "#FB923C",      // orange
  "pre-chorus": "#F472B6", // pink
  chorus: "#86EFAC",     // light green
  mambo: "#3B82F6",      // dark blue
  bridge: "#C084FC",     // purple/magenta
  outro: "#94A3B8",      // slate
};

// ── Marker types (bachata-native terminology) ──────────────────────────

export type MarkerType =
  | "count"
  | "break"
  | "accent"
  | "rhythmChange"
  | "section";

export interface Marker {
  id: string;
  timeMs: number;
  type: MarkerType;
  /** e.g. "1","2","3","tap" for counts; "intro","verse","chorus","bridge","outro" for sections */
  label?: string;
}

// ── Song metadata (from Spotify) ────────────────────────────────────────

export interface Song {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  addedAt: string;
}

// ── Breakdown (annotations for a song) ──────────────────────────────────

export interface Breakdown {
  songId: string;
  markers: Marker[];
  updatedAt: string;
}

// ── Export format ────────────────────────────────────────────────────────

export interface SongExport {
  song: Song;
  breakdown: Breakdown;
}

// ── Marker display config ───────────────────────────────────────────────

export const MARKER_CONFIG: Record<
  MarkerType,
  { label: string; color: string; shortcut: string }
> = {
  count: { label: "Count", color: "#3B82F6", shortcut: "1" },
  break: { label: "Break", color: "#EF4444", shortcut: "2" },
  accent: { label: "Accent", color: "#F59E0B", shortcut: "3" },
  rhythmChange: { label: "Rhythm Change", color: "#8B5CF6", shortcut: "4" },
  section: { label: "Section", color: "#10B981", shortcut: "5" },
};

export const SECTION_LABELS = [
  "intro",
  "verse",
  "chorus",
  "bridge",
  "outro",
] as const;

export const COUNT_LABELS = ["1", "2", "3", "4", "1-2-3-tap"] as const;

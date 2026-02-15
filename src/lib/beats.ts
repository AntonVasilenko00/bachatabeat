import type { CountChange } from "@/types";

/** Milliseconds per beat */
export function beatIntervalMs(bpm: number): number {
  if (bpm <= 0) return 0;
  return 60000 / bpm;
}

/** Convert beat index → time in ms */
export function beatToMs(
  beatIndex: number,
  bpm: number,
  firstBeatMs: number
): number {
  return firstBeatMs + beatIndex * beatIntervalMs(bpm);
}

/** Convert time in ms → beat index (floored) */
export function msToBeat(
  ms: number,
  bpm: number,
  firstBeatMs: number
): number {
  const interval = beatIntervalMs(bpm);
  if (interval <= 0 || ms < firstBeatMs) return -1;
  return Math.floor((ms - firstBeatMs) / interval);
}

/** Nearest beat index to a given ms position */
export function nearestBeat(
  ms: number,
  bpm: number,
  firstBeatMs: number
): number {
  const interval = beatIntervalMs(bpm);
  if (interval <= 0) return 0;
  if (ms < firstBeatMs) return 0;
  return Math.round((ms - firstBeatMs) / interval);
}

/** Total number of beats in the song */
export function getTotalBeats(
  durationMs: number,
  bpm: number,
  firstBeatMs: number
): number {
  const interval = beatIntervalMs(bpm);
  if (interval <= 0 || durationMs <= firstBeatMs) return 0;
  return Math.floor((durationMs - firstBeatMs) / interval);
}

/**
 * Get the count (1–8) for a given beat index,
 * taking into account sorted count changes.
 */
export function getCountForBeat(
  beatIndex: number,
  countChanges: CountChange[]
): number {
  // Find the most recent count change at or before this beat
  let relevantChange: CountChange | null = null;
  for (const change of countChanges) {
    if (change.beatIndex <= beatIndex) {
      relevantChange = change;
    } else {
      break;
    }
  }

  if (relevantChange) {
    const beatsSince = beatIndex - relevantChange.beatIndex;
    return ((relevantChange.resetTo - 1 + beatsSince) % 8) + 1;
  }

  // Natural counting from beat 0
  return (beatIndex % 8) + 1;
}

/**
 * Generate all counts for a range of beats.
 * Returns an array of count numbers (1–8).
 */
export function generateCounts(
  totalBeats: number,
  countChanges: CountChange[]
): number[] {
  const counts: number[] = [];
  for (let i = 0; i < totalBeats; i++) {
    counts.push(getCountForBeat(i, countChanges));
  }
  return counts;
}

/** Segment for song structure: either from section markers or 8-beat blocks */
export interface StructureSegment {
  startBeat: number;
  endBeat: number;
  label?: string;
}

/**
 * Build song structure segments. If there are section markers, one segment per
 * section; otherwise one segment per 8 beats (breakdown by eights).
 */
export function getStructureSegments(
  totalBeats: number,
  sectionMarkers: { beatIndex: number; label?: string }[]
): StructureSegment[] {
  const sorted = [...sectionMarkers].filter((m) => m.beatIndex < totalBeats).sort((a, b) => a.beatIndex - b.beatIndex);

  if (sorted.length === 0) {
    const segments: StructureSegment[] = [];
    for (let start = 0; start < totalBeats; start += 8) {
      segments.push({
        startBeat: start,
        endBeat: Math.min(start + 8, totalBeats),
      });
    }
    return segments;
  }

  const segments: StructureSegment[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const startBeat = sorted[i].beatIndex;
    const endBeat = i + 1 < sorted.length ? sorted[i + 1].beatIndex : totalBeats;
    if (endBeat > startBeat) {
      segments.push({
        startBeat,
        endBeat,
        label: sorted[i].label,
      });
    }
  }
  return segments;
}

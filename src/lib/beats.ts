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

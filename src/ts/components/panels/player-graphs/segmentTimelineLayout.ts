/**
 * Pure layout maths for the {@link SegmentTimelineCanvas}, kept free of any canvas or DOM access so
 * it can be unit tested. Everything here is a function of numbers in, numbers out.
 */

export interface TimelineWindow {
  /** Media time at the left edge of the lanes. */
  start: number;
  /** How many seconds the lanes span. */
  seconds: number;
}

/**
 * Resolves the visible time window.
 *
 * The window holds still while playback advances through the first `holdFraction` of it, so the
 * playhead sweeps left to right. Past that point the window follows playback, so the playhead stays
 * put and the content scrolls left instead. It never starts before the seekable range, never ends
 * after it — near the end of a stream the window stops and the playhead moves on to the right edge —
 * and never spans more than the range actually contains, so a 30 second clip fills the lanes rather
 * than leaving half of them empty.
 */
export function resolveWindow(
  currentTime: number,
  seekableStart: number,
  seekableEnd: number,
  maxWindowSeconds: number,
  holdFraction: number,
): TimelineWindow {
  const seekableSeconds = seekableEnd - seekableStart;
  const seconds =
    isFinite(seekableSeconds) && seekableSeconds > 0 ? Math.min(maxWindowSeconds, seekableSeconds) : maxWindowSeconds;
  const start = Math.max(seekableStart, Math.min(currentTime - seconds * holdFraction, seekableEnd - seconds));

  return { start, seconds };
}

/**
 * Picks the coarsest tick step from `candidates` whose labels fit into `laneWidth`, so labels never
 * collide. Falls back to the coarsest candidate when even that does not fit.
 */
export function resolveTickStep(
  laneWidth: number,
  windowSeconds: number,
  minPxPerLabel: number,
  candidates: readonly number[],
): number {
  const maxLabels = Math.max(1, Math.floor(laneWidth / minPxPerLabel));

  return candidates.find(step => windowSeconds / step <= maxLabels) ?? candidates[candidates.length - 1];
}

/**
 * Shortens `text` with a trailing ellipsis until `measure` reports it fits `maxWidth`. `measure` is
 * injected so this stays testable without a canvas context.
 */
export function truncateToWidth(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
  ellipsis: string,
): string {
  if (measure(text) <= maxWidth) {
    return text;
  }

  let shortened = text;
  while (shortened.length > 1 && measure(shortened + ellipsis) > maxWidth) {
    shortened = shortened.slice(0, -1);
  }

  return shortened + ellipsis;
}

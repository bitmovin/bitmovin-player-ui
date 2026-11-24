/**
 * Pure layout maths for the {@link SegmentTimelineGraph} and the {@link DownloadSpeedGraph}, kept free of
 * any canvas or DOM access so it can be unit tested.
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
 * Picks the finest tick step from `candidates`, in ascending order, whose labels fit into `laneWidth`,
 * so labels never collide. Falls back to the coarsest candidate when even that does not fit.
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
 * Moves label positions apart so that neighbours are at least `minSpacing` apart, keeping their
 * order and staying between `top` and `bottom`. A label moves only as far as its neighbours make it:
 * down from the one above, and up where the labels run past `bottom`. Returns null when the labels
 * need more room than `top` to `bottom` gives.
 */
export function spreadLabels(
  wanted: readonly number[],
  minSpacing: number,
  top: number,
  bottom: number,
): number[] | null {
  if (wanted.length === 0) {
    return [];
  }
  if ((wanted.length - 1) * minSpacing > bottom - top) {
    return null;
  }

  const order = wanted.map((y, index) => ({ y, index })).sort((left, right) => left.y - right.y);
  const placed = order.map(({ y }) => Math.min(Math.max(y, top), bottom));
  for (let i = 1; i < placed.length; i++) {
    placed[i] = Math.max(placed[i], placed[i - 1] + minSpacing);
  }
  for (let i = placed.length - 1; i >= 0; i--) {
    placed[i] = Math.min(placed[i], i === placed.length - 1 ? bottom : placed[i + 1] - minSpacing);
  }

  const result: number[] = [];
  order.forEach(({ index }, position) => (result[index] = placed[position]));

  return result;
}

/**
 * Like {@link spreadLabels}, but the label at `anchor` keeps its wanted position where the labels above
 * and below it leave room, and otherwise moves only as far as they need. The others spread above and
 * below it in order. Labels wanted at exactly the anchor's position go to the side with more room.
 * Returns null when the labels need more room than `top` to `bottom` gives.
 */
export function spreadLabelsAround(
  wanted: readonly number[],
  anchor: number,
  minSpacing: number,
  top: number,
  bottom: number,
): number[] | null {
  const target = wanted[anchor];
  const tiesAbove = target - top >= bottom - target;
  const above: number[] = [];
  const below: number[] = [];
  wanted.forEach((y, index) => {
    if (index !== anchor) {
      (y < target || (y === target && tiesAbove) ? above : below).push(index);
    }
  });
  const lowest = top + above.length * minSpacing;
  const highest = bottom - below.length * minSpacing;
  if (lowest > highest) {
    return null;
  }

  const anchorY = Math.min(Math.max(target, lowest), highest);
  // Both sides fit by the choice of `anchorY`.
  const placedAbove = spreadLabels(
    above.map(index => wanted[index]),
    minSpacing,
    top,
    anchorY - minSpacing,
  )!;
  const placedBelow = spreadLabels(
    below.map(index => wanted[index]),
    minSpacing,
    anchorY + minSpacing,
    bottom,
  )!;

  const result: number[] = [];
  result[anchor] = anchorY;
  above.forEach((index, position) => (result[index] = placedAbove[position]));
  below.forEach((index, position) => (result[index] = placedBelow[position]));

  return result;
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

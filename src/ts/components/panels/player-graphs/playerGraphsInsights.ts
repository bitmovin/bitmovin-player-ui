import type { PlayerGraphsRendition, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { mediaSpan } from '../../../utils/SegmentHistory';
import type { GraphFrame } from './GraphCanvas';

/**
 * A finding the panel states in words in its `Insights` section.
 */
export interface PlayerGraphsInsight {
  /**
   * What it is about: segments that needed retries, a rendition whose declared segment times drift
   * from its media, audio muxed into the video segments, segments refilled from the player's own
   * segment cache, the player error a snapshot was taken at, or a media type without downloads while its
   * buffer has room.
   */
  kind: 'retries' | 'timing' | 'muxed' | 'reuse' | 'error' | 'wait';
  /** How many segments, renditions, errors or media types it covers. */
  count: number;
  text: string;
}

/** A rendition whose segments play at other times or for other durations than its manifest declares. */
export interface TimingDrift {
  rendition: PlayerGraphsRendition;
  declaredDuration: number;
  realDuration: number;
  /** The URL of the first segment found drifting. */
  url?: string;
}

/** How far the real duration of a segment may differ from the declared one, as a ratio. */
const DRIFT_SCALE_TOLERANCE = 0.005;
const MIN_DRIFT_OFFSET_SECONDS = 0.05;

/**
 * The renditions whose segments drift from the manifest, in lane order. Two drifting segments in a
 * row make a drift: a single segment declared short moves the segments after it by a constant.
 */
export function findTimingDrifts(frame: GraphFrame): TimingDrift[] {
  return frame.renditions
    .map(rendition => {
      let candidate: TimingDrift | undefined;
      for (const record of frame.records) {
        if (record.representationId !== rendition.id || record.mediaStart == null || !(record.end > record.start)) {
          continue;
        }
        const drift = measureDrift(rendition, record);
        if (drift && candidate) {
          return candidate;
        }
        candidate = drift;
      }

      return undefined;
    })
    .filter((drift): drift is TimingDrift => drift != null);
}

/** The findings for a frame whose timeline window starts at `windowStart`. */
export function collectInsights(frame: GraphFrame, drifts: TimingDrift[], windowStart: number): PlayerGraphsInsight[] {
  const insights: PlayerGraphsInsight[] = [];
  (['video', 'audio'] as const).forEach(mediaType => {
    const wait = frame.state.downloadWaits?.[mediaType];
    if (wait) {
      insights.push({
        kind: 'wait',
        count: 1,
        text:
          `No ${mediaType} segment has downloaded for ${Math.floor(wait.seconds)} s although the buffer has room, ` +
          'marked where the buffer ends: the server may hold a request open, or the player may have stopped requesting.',
      });
    }
  });
  const laneIds = frame.renditions.map(rendition => rendition.id);
  const retried = frame.records.filter(
    record => record.failures > 0 && laneIds.includes(record.representationId) && mediaSpan(record).end >= windowStart,
  ).length;
  if (retried > 0) {
    insights.push({
      kind: 'retries',
      count: retried,
      text:
        `${segments(retried)} on the timeline needed retries: a red bar along the top edge marks one ` +
        'that then downloaded, a red block one that never did.',
    });
  }
  drifts.forEach(drift => insights.push({ kind: 'timing', count: 1, text: describeDrift(drift) }));
  if (frame.state.muxedAudio) {
    insights.push({
      kind: 'muxed',
      count: 1,
      text: 'Audio is muxed into the video segments, so it has no lanes or downloads of its own.',
    });
  }
  const reused = frame.records.filter(record => (record.reused ?? 0) > 0);
  if (reused.length > 0) {
    const reuses = reused.reduce((sum, record) => sum + record.reused, 0);
    insights.push({
      kind: 'reuse',
      count: reused.length,
      text:
        `${segments(reused.length)} ${reused.length === 1 ? 'was' : 'were'} refilled from the player's own segment cache without a new request` +
        `${reuses > reused.length ? ` (${reuses} times in all)` : ''}, marked "player cache". This follows a buffer ` +
        'flush, such as a seek back or an ad break.',
    });
  }

  return insights;
}

export function describeError(
  code: number,
  name: string | undefined,
  message: string | undefined,
  at: string,
): PlayerGraphsInsight {
  return {
    kind: 'error',
    count: 1,
    text: `Player error ${code}${name ? ` ${name}` : ''}${message ? `: ${message}` : ''}, at ${at}.`,
  };
}

function measureDrift(rendition: PlayerGraphsRendition, record: SegmentRecord): TimingDrift | undefined {
  const declaredDuration = record.end - record.start;
  const realDuration = record.mediaEnd - record.mediaStart;
  const offset = Math.abs(record.mediaStart - record.start);
  const exact =
    Math.abs(realDuration / declaredDuration - 1) <= DRIFT_SCALE_TOLERANCE &&
    offset <= Math.max(MIN_DRIFT_OFFSET_SECONDS, declaredDuration / 2);

  return exact ? undefined : { rendition, declaredDuration, realDuration, url: record.url };
}

/** For example `Audio "en": manifest declares segments of 2.000s, but they last 1.963s, ... First seen at segment_220.ts.` */
function describeDrift({ rendition, declaredDuration, realDuration, url }: TimingDrift): string {
  const declared = declaredDuration.toFixed(3);
  const real = realDuration.toFixed(3);
  const name = `${capitalize(rendition.mediaType)} "${rendition.label}"`;
  const finding =
    declared === real
      ? `${name}: manifest segment times are offset from the media`
      : `${name}: manifest declares segments of ${declared}s, but they last ${real}s, so its timeline drifts from the media`;

  return url ? `${finding}. First seen at ${segmentName(url)}.` : `${finding}.`;
}

/** The last path component of a segment URL, without its query. */
function segmentName(url: string): string {
  const path = url.split(/[?#]/)[0];

  return path.slice(path.lastIndexOf('/') + 1) || url;
}

function segments(count: number): string {
  return count === 1 ? '1 segment' : `${count} segments`;
}

function capitalize(mediaType: SegmentMediaType): string {
  return mediaType === 'video' ? 'Video' : 'Audio';
}

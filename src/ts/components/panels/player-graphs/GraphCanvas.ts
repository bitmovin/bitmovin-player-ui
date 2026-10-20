import { DOM } from '../../../DOM';
import type { PlayerGraphsRendition, SegmentRecord } from '../../../utils/SegmentHistory';
import { StringUtils } from '../../../utils/StringUtils';
import { Component, ComponentConfig } from '../../Component';

/**
 * The player state the graphs are drawn for.
 */
export interface PlayerGraphsPlayerState {
  currentTime: number;
  seekableStart: number;
  seekableEnd: number;
  isLive: boolean;
  /** Where a time shift of zero lands on the playback timeline, live sources only. */
  liveEdge?: number;
  /** The rendition IDs being decoded, video and audio. */
  activeRenditionIds: string[];
  /** Whether the audio being played is muxed into the video segments, so it has no lanes of its own. */
  muxedAudio: boolean;
}

/**
 * Everything one repaint of the graphs is drawn from.
 */
export interface GraphFrame {
  records: readonly SegmentRecord[];
  renditions: readonly PlayerGraphsRendition[];
  state: PlayerGraphsPlayerState;
  /** The position the view shows, which is the player position unless the view stands still. */
  currentTime: number;
  /** Whether the view stands still, so positions are labelled to the hundredth. */
  stillView: boolean;
  /** How many downloads of a media type reported no size. */
  unsized: Partial<Record<PlayerGraphsRendition['mediaType'], number>>;
}

/**
 * The x axis that both graphs share, as laid out by the segment timeline.
 */
export interface PlotGeometry {
  labelLeft: number;
  labelWidth: number;
  plotLeft: number;
  plotWidth: number;
  windowStart: number;
  windowSeconds: number;
}

export const FONT = '11px Arial';
export const FONT_BOLD = 'bold 11px Arial';
export const ELLIPSIS = '…';
export const LABEL_COLOR = 'rgba(255, 255, 255, 0.62)';
export const LIVE_EDGE_COLOR = '#ffd166';
export const LIVE_EDGE_DASH = [4, 3];
export const FAILED_COLOR = '#d64545';

export function toX(geometry: PlotGeometry, time: number): number {
  return geometry.plotLeft + ((time - geometry.windowStart) / geometry.windowSeconds) * geometry.plotWidth;
}

/** Whether `x` lies on the plot, edges included. */
export function isOnPlot(geometry: PlotGeometry, x: number): boolean {
  return x >= geometry.plotLeft && x <= geometry.plotLeft + geometry.plotWidth;
}

/** The ID of the given media type's rendition being decoded, if one is. */
export function activeRenditionOf(
  frame: GraphFrame,
  mediaType: PlayerGraphsRendition['mediaType'],
): string | undefined {
  return frame.renditions.find(
    rendition => rendition.mediaType === mediaType && frame.state.activeRenditionIds.includes(rendition.id),
  )?.id;
}

/**
 * A vertical line across `top` to `bottom`, snapped to a pixel centre so it stays sharp and lines up
 * with the same line in the other graph.
 */
export function drawVerticalLine(
  context: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  color: string,
  dash: number[] = [],
): void {
  context.strokeStyle = color;
  context.setLineDash(dash);
  context.beginPath();
  context.moveTo(Math.round(x) + 0.5, top);
  context.lineTo(Math.round(x) + 0.5, bottom);
  context.stroke();
  context.setLineDash([]);
}

/**
 * `mm:ss` below an hour and `hh:mm:ss` up to a day. Beyond a day the position is wall-clock time, as
 * some live streams report, and it is shown as the time of day (UTC). `reference` picks the notation,
 * so the labels along one axis share one.
 */
export function formatClock(seconds: number, reference = seconds): string {
  const scale = Math.abs(reference);
  if (scale >= SECONDS_PER_DAY) {
    return StringUtils.secondsToTime(
      ((seconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY,
      StringUtils.FORMAT_HHMMSS,
    );
  }

  return StringUtils.secondsToTime(seconds, scale >= 3600 ? StringUtils.FORMAT_HHMMSS : StringUtils.FORMAT_MMSS);
}

/** {@link formatClock}, with hundredths when `precise`. */
export function formatPlayheadTime(seconds: number, precise: boolean): string {
  const time = formatClock(seconds);
  if (!precise) {
    return time;
  }
  // Scaled before the remainder is taken: `36.47 % 1` is `0.4699…`, which would floor to `.46`.
  const hundredths = Math.floor(Math.abs(seconds) * 100 + 1e-6) % 100;

  return `${time}.${String(hundredths).padStart(2, '0')}`;
}

const SECONDS_PER_DAY = 86400;

/**
 * A canvas that is repainted as a whole, sized to the width of its parent in device pixels.
 */
export abstract class GraphCanvas extends Component<ComponentConfig> {
  private context: CanvasRenderingContext2D | null = null;

  protected toDomElement(): DOM {
    return new DOM('canvas', { class: this.getCssClasses() }, this);
  }

  protected getContext(): CanvasRenderingContext2D | null {
    if (!this.context) {
      this.context = this.getCanvas().getContext('2d');
    }

    return this.context;
  }

  protected getCssWidth(): number {
    return Math.max(1, this.getCanvas().parentElement?.clientWidth ?? 0);
  }

  /**
   * Resizes and clears the canvas. The backing store is sized in device pixels and the context scaled
   * to match, so text and hairlines stay sharp on high-DPI displays. Resizing resets the context
   * state, so the font is set again.
   */
  protected resize(context: CanvasRenderingContext2D, cssWidth: number, cssHeight: number): void {
    const canvas = this.getCanvas();
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.font = FONT;
    context.textBaseline = 'middle';
  }

  private getCanvas(): HTMLCanvasElement {
    return this.getDomElement().get(0) as HTMLCanvasElement;
  }
}

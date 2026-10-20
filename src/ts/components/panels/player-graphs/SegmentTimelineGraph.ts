import type { PlayerGraphsRendition, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { ComponentConfig } from '../../Component';
import {
  activeRenditionOf,
  drawVerticalLine,
  ELLIPSIS,
  FAILED_COLOR,
  FONT,
  FONT_BOLD,
  formatClock,
  formatPlayheadTime,
  GraphCanvas,
  GraphFrame,
  isOnPlot,
  LABEL_COLOR,
  LIVE_EDGE_COLOR,
  LIVE_EDGE_DASH,
  PlotGeometry,
  toX,
} from './GraphCanvas';
import { resolveTickStep, resolveWindow, truncateToWidth } from './segmentTimelineLayout';

const LABEL_X = 6;
const LABEL_GAP = 8;
const LABEL_MAX_WIDTH_RATIO = 0.42;
const RIGHT_MARGIN = 6;
const LEGEND_FONT = '10px Arial';
const LEGEND_HEIGHT = 16;
const LEGEND_TO_LANES_GAP = 6;
const LEGEND_SWATCH = 8;
const LEGEND_SWATCH_BAR = 2;
const LEGEND_LABEL_GAP = 5;
const LEGEND_ENTRY_GAP = 12;
const LANE_HEIGHT = 30;
const LANE_RECT_HEIGHT = 18;
const GROUP_HEADING_HEIGHT = 15;
const MUXED_NOTE_HEIGHT = 16;
const MUXED_NOTE = 'muxed into the video segments';
const AXIS_HEIGHT = 16;
const SEGMENT_GAP_PX = 1;
const RETRY_MARK_HEIGHT = 3;
const MIN_RETRY_COUNT_HEIGHT = 10;
const RETRY_COUNT_PADDING = 4;
const MIN_PX_PER_TICK_LABEL = 52;
const MIN_PX_PER_LONG_TICK_LABEL = 76;
const TICK_STEPS = [5, 10, 15, 20, 30, 60];
const MARKER_LABEL_GAP = 6;
const PLAYHEAD_ANCHOR_HALF_WIDTH = 4;
const PLAYHEAD_ANCHOR_HEIGHT = 5;
const LIVE_EDGE_TOLERANCE_SECONDS = 0.05;
/** The window spans this many seconds at most, and holds still until the playhead is this far into it. */
const MAX_WINDOW_SECONDS = 60;
const PLAYHEAD_HOLD = 0.25;

const DOWNLOADED_COLOR = '#c28744';
const PLAYED_COLOR = '#3f9e5a';
/** A played segment ahead of the playhead, as after a seek back. */
const PLAYED_AHEAD_COLOR = 'rgba(63, 158, 90, 0.45)';
const ACTIVE_LABEL_COLOR = '#ffffff';
const ACTIVE_ROW_COLOR = 'rgba(255, 255, 255, 0.10)';
const GROUP_HEADING_COLOR = 'rgba(255, 255, 255, 0.45)';
const GROUP_DIVIDER_COLOR = 'rgba(255, 255, 255, 0.14)';
const NOTE_COLOR = 'rgba(255, 255, 255, 0.4)';
const LANE_BORDER_COLOR = 'rgba(255, 255, 255, 0.22)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.30)';
const PLAYHEAD_COLOR = '#ffffff';
const RETRY_COUNT_COLOR = '#ffffff';

interface LegendEntry {
  label: string;
  color: string;
  /** A bar along the top of the swatch, for a mark rather than a fill. */
  topBar?: string;
}

/** `retried` is the bar along the top of a segment downloaded after failed attempts, `failed` a segment that never was. */
const LEGEND_ENTRIES: LegendEntry[] = [
  { label: 'downloaded', color: DOWNLOADED_COLOR },
  { label: 'played', color: PLAYED_COLOR },
  { label: 'played earlier', color: PLAYED_AHEAD_COLOR },
  { label: 'failed', color: FAILED_COLOR },
  { label: 'retried', color: DOWNLOADED_COLOR, topBar: FAILED_COLOR },
];

/** Where a label was drawn along x, so later labels can keep clear of it. */
interface LabelSpan {
  left: number;
  right: number;
}

/** The vertical extent of the lanes, and the row the marker labels share. */
interface LaneArea {
  top: number;
  bottom: number;
  labelY: number;
}

/**
 * Draws one lane per rendition with the segments recorded for it, a time axis, the playhead and, on
 * live sources, the live edge.
 *
 * @category Components
 */
export class SegmentTimelineGraph extends GraphCanvas {
  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, { cssClass: 'ui-player-graphs-segment-timeline' }, this.config);
  }

  /** Repaints the timeline, and returns the x axis it laid out for the graph below to share. */
  render(frame: GraphFrame): PlotGeometry | null {
    const context = this.getContext();
    if (!context) {
      return null;
    }

    const { state, renditions, currentTime } = frame;
    const width = this.getCssWidth();
    // On live the seekable range is the DVR window, which can be a few seconds or none at all, while
    // the segments before it were downloaded and played all the same.
    const timelineWindow = state.isLive
      ? resolveWindow(currentTime, -Infinity, Infinity, MAX_WINDOW_SECONDS, PLAYHEAD_HOLD)
      : resolveWindow(currentTime, state.seekableStart, state.seekableEnd, MAX_WINDOW_SECONDS, PLAYHEAD_HOLD);
    const windowEnd = timelineWindow.start + timelineWindow.seconds;

    context.font = LEGEND_FONT;
    const legendRows = wrapLegend(
      LEGEND_ENTRIES,
      text => context.measureText(text).width,
      width - RIGHT_MARGIN - LABEL_X,
    );
    const muxedNote = state.muxedAudio && !renditions.some(rendition => rendition.mediaType === 'audio');
    const groupCount = renditions.filter((_, index) => isGroupStart(renditions, index)).length;
    const lanesTop = legendRows.length * LEGEND_HEIGHT + LEGEND_TO_LANES_GAP;
    const height =
      lanesTop +
      groupCount * GROUP_HEADING_HEIGHT +
      (muxedNote ? GROUP_HEADING_HEIGHT + MUXED_NOTE_HEIGHT : 0) +
      renditions.length * LANE_HEIGHT +
      AXIS_HEIGHT;
    this.resize(context, width, height);

    const measure = (text: string) => context.measureText(text).width;
    const labelWidth = Math.min(
      Math.max(0, ...renditions.map(rendition => measure(rendition.label))),
      width * LABEL_MAX_WIDTH_RATIO,
    );
    const plotLeft = LABEL_X + labelWidth + LABEL_GAP;
    const geometry: PlotGeometry = {
      labelLeft: LABEL_X,
      labelWidth,
      plotLeft,
      plotWidth: Math.max(0, width - plotLeft - RIGHT_MARGIN),
      windowStart: timelineWindow.start,
      windowSeconds: timelineWindow.seconds,
    };
    const visible = frame.records.filter(record => record.end > timelineWindow.start && record.start < windowEnd);

    let rowY = lanesTop;
    renditions.forEach((rendition, index) => {
      if (isGroupStart(renditions, index)) {
        this.drawGroupHeading(context, rendition.mediaType, rowY, width, index > 0);
        rowY += GROUP_HEADING_HEIGHT;
      }
      this.drawLane(context, frame, geometry, rendition, rowY, width, visible);
      rowY += LANE_HEIGHT;
    });

    if (muxedNote) {
      this.drawGroupHeading(context, 'audio', rowY, width, renditions.length > 0);
      context.fillStyle = NOTE_COLOR;
      context.fillText(MUXED_NOTE, plotLeft, rowY + GROUP_HEADING_HEIGHT + MUXED_NOTE_HEIGHT / 2);
    }

    this.drawLegend(context, legendRows, width);
    this.drawTimeAxis(context, geometry, height - AXIS_HEIGHT);

    const lanes: LaneArea = {
      top: lanesTop,
      bottom: height - AXIS_HEIGHT,
      labelY: lanesTop + GROUP_HEADING_HEIGHT / 2,
    };
    const labels: LabelSpan[] = [];
    this.drawPlayhead(context, geometry, frame, lanes, labels);
    if (state.liveEdge != null && Number.isFinite(state.liveEdge)) {
      const distance = state.liveEdge - currentTime;
      const offPlot = toX(geometry, state.liveEdge) > geometry.plotLeft + geometry.plotWidth;
      const label =
        Math.abs(distance) < LIVE_EDGE_TOLERANCE_SECONDS
          ? 'live'
          : `live ${formatSignedSeconds(-distance)}${offPlot ? ' ▸' : ''}`;
      this.drawMarker(context, geometry, state.liveEdge, label, LIVE_EDGE_COLOR, LIVE_EDGE_DASH, lanes, labels);
    }

    return geometry;
  }

  private drawLane(
    context: CanvasRenderingContext2D,
    frame: GraphFrame,
    geometry: PlotGeometry,
    rendition: PlayerGraphsRendition,
    rowY: number,
    width: number,
    visible: readonly SegmentRecord[],
  ): void {
    const active = activeRenditionOf(frame, rendition.mediaType) === rendition.id;
    const laneY = rowY + (LANE_HEIGHT - LANE_RECT_HEIGHT) / 2;
    if (active) {
      context.fillStyle = ACTIVE_ROW_COLOR;
      context.fillRect(0, laneY, width, LANE_RECT_HEIGHT);
    }

    context.font = active ? FONT_BOLD : FONT;
    context.fillStyle = active ? ACTIVE_LABEL_COLOR : LABEL_COLOR;
    const measure = (text: string) => context.measureText(text).width;
    context.fillText(
      truncateToWidth(measure, rendition.label, geometry.labelWidth, ELLIPSIS),
      LABEL_X,
      laneY + LANE_RECT_HEIGHT / 2,
    );
    context.font = FONT;
    context.strokeStyle = LANE_BORDER_COLOR;
    context.strokeRect(geometry.plotLeft, laneY, geometry.plotWidth, LANE_RECT_HEIGHT);

    const plotRight = geometry.plotLeft + geometry.plotWidth;
    visible.forEach(record => {
      if (record.representationId !== rendition.id) {
        return;
      }

      // Whole pixels, so neighbours do not anti-alias into dark seams, and a pixel apart, so they stay countable.
      const startX = Math.round(Math.max(geometry.plotLeft + 1, toX(geometry, record.start)));
      const endX = Math.round(Math.min(plotRight - 1, toX(geometry, record.end)));
      if (endX <= startX) {
        return;
      }
      const segmentWidth = Math.max(1, endX - startX - SEGMENT_GAP_PX);

      // The segment under the playhead of the rendition being decoded plays now, whether or not its
      // `SegmentPlayback` has arrived, so the video and audio lanes agree across boundaries their grids do not share.
      const playingNow = active && frame.currentTime >= record.start && frame.currentTime < record.end;
      context.fillStyle = resolveSegmentColor(record, playingNow, record.start > frame.currentTime);
      context.fillRect(startX, laneY + 1, segmentWidth, LANE_RECT_HEIGHT - 2);

      if (record.failures > 0) {
        this.drawRetryMark(context, record.failures, startX, segmentWidth, laneY);
      }
    });
  }

  /** A red bar along the top edge, with the count inside where the segment is wide enough for it. */
  private drawRetryMark(
    context: CanvasRenderingContext2D,
    failures: number,
    x: number,
    width: number,
    laneY: number,
  ): void {
    context.fillStyle = FAILED_COLOR;
    context.fillRect(x, laneY + 1, width, RETRY_MARK_HEIGHT);

    const label = String(failures);
    const labelWidth = context.measureText(label).width;
    const textTop = laneY + 1 + RETRY_MARK_HEIGHT;
    const textHeight = LANE_RECT_HEIGHT - 2 - RETRY_MARK_HEIGHT;
    if (labelWidth + RETRY_COUNT_PADDING > width || textHeight < MIN_RETRY_COUNT_HEIGHT) {
      return;
    }
    context.fillStyle = RETRY_COUNT_COLOR;
    context.fillText(label, x + (width - labelWidth) / 2, textTop + textHeight / 2);
  }

  /** The `Video` or `Audio` heading above a group of lanes, with a divider above every group but the first. */
  private drawGroupHeading(
    context: CanvasRenderingContext2D,
    mediaType: SegmentMediaType,
    rowY: number,
    width: number,
    withDivider: boolean,
  ): void {
    if (withDivider) {
      context.strokeStyle = GROUP_DIVIDER_COLOR;
      context.beginPath();
      context.moveTo(LABEL_X, rowY + 1);
      context.lineTo(width - RIGHT_MARGIN, rowY + 1);
      context.stroke();
    }

    context.font = FONT_BOLD;
    context.fillStyle = GROUP_HEADING_COLOR;
    context.fillText(mediaType === 'video' ? 'Video' : 'Audio', LABEL_X, rowY + GROUP_HEADING_HEIGHT / 2 + 2);
    context.font = FONT;
  }

  /** The colour key above the lanes, right-aligned, one line per row. */
  private drawLegend(context: CanvasRenderingContext2D, rows: LegendEntry[][], width: number): void {
    context.font = LEGEND_FONT;
    rows.forEach((row, rowIndex) => {
      let x = Math.max(LABEL_X, width - RIGHT_MARGIN - legendRowWidth(row, text => context.measureText(text).width));
      const centreY = rowIndex * LEGEND_HEIGHT + LEGEND_HEIGHT / 2 + 1;
      row.forEach(({ label, color, topBar }) => {
        context.fillStyle = color;
        context.fillRect(x, centreY - LEGEND_SWATCH / 2, LEGEND_SWATCH, LEGEND_SWATCH);
        if (topBar) {
          context.fillStyle = topBar;
          context.fillRect(x, centreY - LEGEND_SWATCH / 2, LEGEND_SWATCH, LEGEND_SWATCH_BAR);
        }
        x += LEGEND_SWATCH + LEGEND_LABEL_GAP;
        context.fillStyle = LABEL_COLOR;
        context.fillText(label, x, centreY);
        x += context.measureText(label).width + LEGEND_ENTRY_GAP;
      });
    });
    context.font = FONT;
  }

  private drawTimeAxis(context: CanvasRenderingContext2D, geometry: PlotGeometry, axisY: number): void {
    const windowEnd = geometry.windowStart + geometry.windowSeconds;
    const plotRight = geometry.plotLeft + geometry.plotWidth;
    const step = resolveTickStep(
      geometry.plotWidth,
      geometry.windowSeconds,
      Math.abs(windowEnd) >= 3600 ? MIN_PX_PER_LONG_TICK_LABEL : MIN_PX_PER_TICK_LABEL,
      TICK_STEPS,
    );

    context.strokeStyle = AXIS_COLOR;
    context.fillStyle = LABEL_COLOR;
    context.beginPath();
    context.moveTo(geometry.plotLeft, axisY);
    context.lineTo(plotRight, axisY);
    context.stroke();

    let previousLabelRight = -Infinity;
    for (let time = Math.ceil(geometry.windowStart / step) * step; time <= windowEnd; time += step) {
      const x = toX(geometry, time);
      const label = formatClock(time, windowEnd);
      const labelWidth = context.measureText(label).width;
      // The last label is pulled in from the edge. Where it then lands on the label before it, only its tick is drawn.
      const labelX = Math.min(x + 2, plotRight - labelWidth);
      context.beginPath();
      context.moveTo(x, axisY);
      context.lineTo(x, axisY + 3);
      context.stroke();
      if (labelX >= previousLabelRight + MARKER_LABEL_GAP) {
        context.fillText(label, labelX, axisY + 9);
        previousLabelRight = labelX + labelWidth;
      }
    }
  }

  /** The playhead across all lanes, with a downward anchor and the position beside its top. */
  private drawPlayhead(
    context: CanvasRenderingContext2D,
    geometry: PlotGeometry,
    frame: GraphFrame,
    lanes: LaneArea,
    labels: LabelSpan[],
  ): void {
    const x = Math.round(toX(geometry, frame.currentTime));
    if (!isOnPlot(geometry, x)) {
      return;
    }

    drawVerticalLine(context, x, lanes.top, lanes.bottom, PLAYHEAD_COLOR);
    context.fillStyle = PLAYHEAD_COLOR;
    context.beginPath();
    context.moveTo(x - PLAYHEAD_ANCHOR_HALF_WIDTH, lanes.top - PLAYHEAD_ANCHOR_HEIGHT);
    context.lineTo(x + PLAYHEAD_ANCHOR_HALF_WIDTH, lanes.top - PLAYHEAD_ANCHOR_HEIGHT);
    context.lineTo(x, lanes.top);
    context.closePath();
    context.fill();

    if (frame.renditions.length === 0) {
      return;
    }

    const label = formatPlayheadTime(frame.currentTime, frame.stillView);
    const labelWidth = context.measureText(label).width;
    const labelX =
      x + MARKER_LABEL_GAP + labelWidth <= geometry.plotLeft + geometry.plotWidth
        ? x + MARKER_LABEL_GAP
        : x - MARKER_LABEL_GAP - labelWidth;
    context.fillText(label, labelX, lanes.labelY);
    labels.push({ left: labelX, right: labelX + labelWidth });
  }

  /**
   * A dashed line across the lanes at `time`, labelled in the first heading row right of the line, or
   * left of it where the label would run off the plot. A time beyond the right edge draws no line and
   * puts the label at the edge. A label that would overlap one already drawn is left out.
   */
  private drawMarker(
    context: CanvasRenderingContext2D,
    geometry: PlotGeometry,
    time: number,
    label: string,
    color: string,
    dash: number[],
    lanes: LaneArea,
    labels: LabelSpan[],
  ): void {
    const x = toX(geometry, time);
    const plotRight = geometry.plotLeft + geometry.plotWidth;
    if (x < geometry.plotLeft) {
      return;
    }

    context.font = FONT;
    context.fillStyle = color;
    const labelWidth = context.measureText(label).width;
    const lineX = Math.round(x);
    let candidates = [plotRight - labelWidth];
    if (x <= plotRight) {
      drawVerticalLine(context, lineX, lanes.top, lanes.bottom, color, dash);
      candidates = [lineX + MARKER_LABEL_GAP, lineX - MARKER_LABEL_GAP - labelWidth];
    }

    const left = candidates.find(
      candidate =>
        candidate >= geometry.plotLeft &&
        candidate + labelWidth <= plotRight &&
        !labels.some(
          span => candidate < span.right + MARKER_LABEL_GAP && candidate + labelWidth > span.left - MARKER_LABEL_GAP,
        ),
    );
    if (left == null || label === '') {
      return;
    }
    context.fillText(label, left, lanes.labelY);
    labels.push({ left, right: left + labelWidth });
  }
}

function isGroupStart(renditions: readonly PlayerGraphsRendition[], index: number): boolean {
  return index === 0 || renditions[index].mediaType !== renditions[index - 1].mediaType;
}

function legendRowWidth(row: LegendEntry[], measure: (text: string) => number): number {
  return row.reduce(
    (width, { label }, index) =>
      width + (index > 0 ? LEGEND_ENTRY_GAP : 0) + LEGEND_SWATCH + LEGEND_LABEL_GAP + measure(label),
    0,
  );
}

/** Splits the legend into rows no wider than `maxWidth`, filling each row before the next. */
function wrapLegend(entries: LegendEntry[], measure: (text: string) => number, maxWidth: number): LegendEntry[][] {
  const rows: LegendEntry[][] = [];
  entries.forEach(entry => {
    const row = rows[rows.length - 1];
    if (row && legendRowWidth([...row, entry], measure) <= maxWidth) {
      row.push(entry);
    } else {
      rows.push([entry]);
    }
  });

  return rows;
}

/** `-12.3s` / `+0.4s`. */
function formatSignedSeconds(seconds: number): string {
  return `${seconds < 0 ? '-' : '+'}${Math.abs(seconds).toFixed(1)}s`;
}

/** A failed download outranks playback, since a segment that could not be fetched is the more important thing to see. */
function resolveSegmentColor(record: SegmentRecord, playingNow: boolean, aheadOfPlayhead: boolean): string {
  if (record.outcome === 'failed') {
    return FAILED_COLOR;
  }
  if (playingNow) {
    return PLAYED_COLOR;
  }
  if (record.played) {
    return aheadOfPlayhead ? PLAYED_AHEAD_COLOR : PLAYED_COLOR;
  }

  return DOWNLOADED_COLOR;
}

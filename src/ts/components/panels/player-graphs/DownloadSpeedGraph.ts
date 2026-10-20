import { DOM } from '../../../DOM';
import { mediaSpan, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { ComponentConfig } from '../../Component';
import {
  activeRenditionOf,
  drawVerticalLine,
  ELLIPSIS,
  FAILED_COLOR,
  FONT,
  FONT_BOLD,
  GraphCanvas,
  GraphFrame,
  isOnPlot,
  LABEL_COLOR,
  LIVE_EDGE_COLOR,
  LIVE_EDGE_DASH,
  PlotGeometry,
  toX,
} from './GraphCanvas';
import { truncateToWidth } from './segmentTimelineLayout';

const PADDING = 6;
const BAND_CAPTION_HEIGHT = 18;
const BAND_GAP = 12;
const MIN_BAND_HEIGHT = 80;
const MAX_BAND_HEIGHT = 360;
const BAND_HEIGHT_PER_RUNG = 24;
const Y_LABEL_INSET = 4;
const Y_LABEL_BACKING_HALF_HEIGHT = 6;
const MIN_TICK_SPACING = 18;
const MIN_RUNG_LABEL_SPACING = 14;
const RUNG_NAME_MIN_DROP = 6;
const RUNG_HOVER_RADIUS = 10;
const TOOLTIP_LINE_HEIGHT = 14;
const TOOLTIP_PADDING = 5;
const CLIPPED_ARROW_HALF_WIDTH = 4;
const CLIPPED_ARROW_HEIGHT = 5;
const CLIPPED_VALUE_GAP = 7;
/** The axis floor follows this percentile of the bars, so one starved request does not flatten the band. */
const FLOOR_PERCENTILE = 0.1;
const FLOOR_HEADROOM = 1.15;
const DECIMAL_PLACE_LIMIT_MBPS = 100;
const SCALE_NOTE = 'log scale';
const MUXED_NOTE = 'muxed into the video segments';
const UNSIZED_NOTE = 'downloads report no size (chunked transfer)';
const BAND_BACKGROUND = 'rgba(255, 255, 255, 0.04)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.22)';
const GRID_COLOR = 'rgba(255, 255, 255, 0.10)';
const VALUE_COLOR = 'rgba(255, 255, 255, 0.85)';
const LABEL_BACKING = 'rgba(20, 20, 20, 0.85)';
const PLAYHEAD_COLOR = 'rgba(255, 255, 255, 0.45)';
const RUNG_COLOR = 'rgba(255, 255, 255, 0.25)';
const RUNG_LABEL_COLOR = 'rgba(255, 255, 255, 0.45)';
const ACTIVE_RUNG_COLOR = 'rgba(255, 255, 255, 0.7)';
const ACTIVE_RUNG_LABEL_COLOR = 'rgba(255, 255, 255, 0.9)';
const RUNG_DASH = [3, 3];
const FAILED_FILL_COLOR = 'rgba(214, 69, 69, 0.12)';
const TOOLTIP_BACKGROUND = 'rgba(16, 16, 16, 0.94)';
const TOOLTIP_BORDER = 'rgba(255, 255, 255, 0.3)';

interface Band {
  mediaType: SegmentMediaType;
  color: string;
  fillTop: string;
  fillBottom: string;
}

const BANDS: Band[] = [
  { mediaType: 'video', color: '#4aa8ff', fillTop: 'rgba(74, 168, 255, 0.38)', fillBottom: 'rgba(74, 168, 255, 0.05)' },
  {
    mediaType: 'audio',
    color: '#8fd3ff',
    fillTop: 'rgba(143, 211, 255, 0.38)',
    fillBottom: 'rgba(143, 211, 255, 0.05)',
  },
];

/** A record with its throughput, as one bar. */
type Sample = SegmentRecord & { mbps: number };

/** The bitrate of one or more renditions of a media type, as a dashed line across its band. */
interface Rung {
  mbps: number;
  label: string;
  active: boolean;
}

interface Scale {
  floorMbps: number;
  topMbps: number;
}

/** A rung as drawn, for the tooltip of the rungs under the pointer. */
interface RungHit {
  y: number;
  text: string;
}

/**
 * Plots the measured download throughput of each segment as a bar under the segment's span on the
 * segment timeline, in one band per media type with its own scale. Audio runs an order of magnitude
 * below video, so on a shared scale it would sit on the baseline.
 *
 * The scale is logarithmic and marks the bitrate of every rendition as a rung, the one being played
 * brighter: a bitrate ladder is roughly geometric, so on a linear scale its lower rungs pile up.
 *
 * @category Components
 */
export class DownloadSpeedGraph extends GraphCanvas {
  private lastRender: { frame: GraphFrame; geometry: PlotGeometry | null } | null = null;
  private rungHits: RungHit[] = [];
  private hoverY: number | null = null;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, { cssClass: 'ui-player-graphs-download-speed' }, this.config);
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();
    // Overlapping rung labels are left out. Hovering a rung names every rung near the pointer.
    element.on('mousemove', (event: MouseEvent) =>
      this.setHover(event.clientY - (event.currentTarget as HTMLElement).getBoundingClientRect().top),
    );
    element.on('mouseleave', () => this.setHover(null));

    return element;
  }

  /** Repaints the graph on the x axis of the segment timeline. Without that axis, nothing is drawn. */
  render(frame: GraphFrame, geometry: PlotGeometry | null): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    this.lastRender = { frame, geometry };
    this.rungHits = [];
    const samples = frame.records.filter((record): record is Sample => record.mbps != null);
    const bands = BANDS.filter(band => isBandShown(band, frame, samples));
    const ladders = bands.map(band => resolveLadder(frame, band.mediaType));
    const bandHeights = ladders.map(ladder =>
      Math.min(MAX_BAND_HEIGHT, Math.max(MIN_BAND_HEIGHT, ladder.length * BAND_HEIGHT_PER_RUNG)),
    );
    const width = this.getCssWidth();
    const height =
      PADDING * 2 +
      bands.length * BAND_CAPTION_HEIGHT +
      Math.max(0, bands.length - 1) * BAND_GAP +
      bandHeights.reduce((sum, bandHeight) => sum + bandHeight, 0);
    this.resize(context, width, height);
    if (!geometry) {
      return;
    }

    let bandTop = PADDING;
    bands.forEach((band, index) => {
      const bandSamples = samples.filter(sample => sample.mediaType === band.mediaType);
      this.drawBand(context, frame, geometry, band, bandTop, bandHeights[index], width, bandSamples, ladders[index]);
      bandTop += BAND_CAPTION_HEIGHT + bandHeights[index] + BAND_GAP;
    });

    const playheadX = toX(geometry, frame.currentTime);
    if (isOnPlot(geometry, playheadX)) {
      drawVerticalLine(context, playheadX, PADDING, height - PADDING, PLAYHEAD_COLOR);
    }
    const liveEdge = frame.state.liveEdge;
    if (liveEdge != null && Number.isFinite(liveEdge) && isOnPlot(geometry, toX(geometry, liveEdge))) {
      drawVerticalLine(context, toX(geometry, liveEdge), PADDING, height - PADDING, LIVE_EDGE_COLOR, LIVE_EDGE_DASH);
    }
    this.drawTooltip(context, geometry, height);
  }

  private setHover(y: number | null): void {
    const near = (hoverY: number | null) =>
      this.rungHits
        .filter(hit => hoverY != null && Math.abs(hit.y - hoverY) <= RUNG_HOVER_RADIUS)
        .map(hit => hit.text)
        .join('|');
    const changed = near(y) !== near(this.hoverY);
    this.hoverY = y;
    if (changed && this.lastRender) {
      this.render(this.lastRender.frame, this.lastRender.geometry);
    }
  }

  private drawBand(
    context: CanvasRenderingContext2D,
    frame: GraphFrame,
    geometry: PlotGeometry,
    band: Band,
    bandTop: number,
    height: number,
    width: number,
    samples: Sample[],
    ladder: Rung[],
  ): void {
    const top = bandTop + BAND_CAPTION_HEIGHT;
    const bottom = top + height;
    const plotRight = geometry.plotLeft + geometry.plotWidth;
    const windowEnd = geometry.windowStart + geometry.windowSeconds;
    const inWindow = (record: SegmentRecord) => {
      const span = mediaSpan(record);
      return span.end > geometry.windowStart && span.start < windowEnd;
    };
    const visible = samples.filter(inWindow);
    const scale = resolveScale(
      visible.map(sample => sample.mbps),
      ladder.map(rung => rung.mbps),
    );
    const toY = (mbps: number) => bottom - logFraction(mbps, scale) * height;
    const ticks = resolveTicks(scale);
    const horizontal = (y: number, color: string, dash: number[] = []) => {
      context.strokeStyle = color;
      context.setLineDash(dash);
      context.beginPath();
      context.moveTo(geometry.plotLeft, Math.round(y) + 0.5);
      context.lineTo(plotRight, Math.round(y) + 0.5);
      context.stroke();
      context.setLineDash([]);
    };

    context.fillStyle = BAND_BACKGROUND;
    context.fillRect(0, bandTop, width, BAND_CAPTION_HEIGHT + height + 2);
    horizontal(bottom, AXIS_COLOR);
    ticks.forEach(tick => horizontal(toY(tick), GRID_COLOR));

    // A request that never downloaded measured nothing, which an empty column would hide.
    const laneIds = frame.renditions.map(rendition => rendition.id);
    frame.records
      .filter(
        record =>
          record.outcome === 'failed' &&
          record.mediaType === band.mediaType &&
          laneIds.includes(record.representationId) &&
          inWindow(record),
      )
      .forEach(record => {
        const span = mediaSpan(record);
        const startX = Math.round(Math.max(geometry.plotLeft, toX(geometry, span.start)));
        const columnWidth = Math.max(1, Math.round(Math.min(plotRight, toX(geometry, span.end))) - startX);
        context.fillStyle = FAILED_FILL_COLOR;
        context.fillRect(startX, top, columnWidth, height);
        context.strokeStyle = FAILED_COLOR;
        context.strokeRect(startX + 0.5, top + 0.5, Math.max(0, columnWidth - 1), height - 1);
      });

    // One gradient for the band rather than one per bar, so two bars of the same height shade alike.
    const fill = context.createLinearGradient(0, top, 0, bottom);
    fill.addColorStop(0, band.fillTop);
    fill.addColorStop(1, band.fillBottom);
    const clipped: { x: number; mbps: number }[] = [];
    visible.forEach(sample => {
      const span = mediaSpan(sample);
      const startX = Math.round(Math.max(geometry.plotLeft, toX(geometry, span.start)));
      const barWidth = Math.max(1, Math.round(Math.min(plotRight, toX(geometry, span.end))) - startX);
      const y = Math.round(toY(sample.mbps));
      context.fillStyle = fill;
      context.fillRect(startX, y, barWidth, bottom - y);
      // A solid cap keeps the value readable where a bar is a pixel or two wide.
      context.fillStyle = band.color;
      context.fillRect(startX, y, barWidth, 1);
      if (sample.mbps < scale.floorMbps) {
        clipped.push({ x: startX + barWidth / 2, mbps: sample.mbps });
      }
    });

    this.drawLadder(context, geometry, ladder, toY, top);
    this.drawClippedMarks(context, band, clipped, bottom);
    this.drawYAxisLabels(context, scale, ticks, toY, top, bottom, plotRight);
    this.drawCaption(context, frame, geometry, band, samples, visible, bandTop + BAND_CAPTION_HEIGHT / 2);
  }

  /**
   * A dashed line at every rung, over the bars, and its name in the label column of the timeline.
   * Where two names would overlap, the one of the rendition being played is kept, then the lower one.
   */
  private drawLadder(
    context: CanvasRenderingContext2D,
    geometry: PlotGeometry,
    ladder: Rung[],
    toY: (mbps: number) => number,
    top: number,
  ): void {
    const lineY = (rung: Rung) => Math.round(toY(rung.mbps)) + 0.5;
    ladder.forEach(rung => {
      context.strokeStyle = rung.active ? ACTIVE_RUNG_COLOR : RUNG_COLOR;
      context.setLineDash(RUNG_DASH);
      context.beginPath();
      context.moveTo(geometry.plotLeft, lineY(rung));
      context.lineTo(geometry.plotLeft + geometry.plotWidth, lineY(rung));
      context.stroke();
      context.setLineDash([]);
      this.rungHits.push({ y: lineY(rung), text: `${rung.label} — ${formatMbps(rung.mbps)} Mbps` });
    });

    const placed: number[] = [];
    const measure = (text: string) => context.measureText(text).width;
    [...ladder.filter(rung => rung.active), ...ladder.filter(rung => !rung.active)].forEach(rung => {
      const y = Math.max(lineY(rung), top + RUNG_NAME_MIN_DROP);
      if (placed.some(placedY => Math.abs(placedY - y) < MIN_RUNG_LABEL_SPACING)) {
        return;
      }
      placed.push(y);
      context.font = rung.active ? FONT_BOLD : FONT;
      context.fillStyle = rung.active ? ACTIVE_RUNG_LABEL_COLOR : RUNG_LABEL_COLOR;
      context.fillText(truncateToWidth(measure, rung.label, geometry.labelWidth, ELLIPSIS), geometry.labelLeft, y);
    });
    context.font = FONT;
  }

  /** A downward arrow on the baseline and the value, for each bar below the floor of the scale. */
  private drawClippedMarks(
    context: CanvasRenderingContext2D,
    band: Band,
    clipped: { x: number; mbps: number }[],
    bottom: number,
  ): void {
    let lastValueRight = -Infinity;
    clipped
      .sort((left, right) => left.x - right.x)
      .forEach(({ x, mbps }) => {
        context.fillStyle = band.color;
        context.beginPath();
        context.moveTo(x - CLIPPED_ARROW_HALF_WIDTH, bottom - CLIPPED_ARROW_HEIGHT);
        context.lineTo(x + CLIPPED_ARROW_HALF_WIDTH, bottom - CLIPPED_ARROW_HEIGHT);
        context.lineTo(x, bottom);
        context.closePath();
        context.fill();

        const value = String(Number(mbps.toPrecision(2)));
        const left = x - context.measureText(value).width / 2;
        if (left >= lastValueRight + Y_LABEL_INSET) {
          lastValueRight = drawBackedText(
            context,
            value,
            left,
            bottom - CLIPPED_ARROW_HEIGHT - CLIPPED_VALUE_GAP,
            VALUE_COLOR,
          );
        }
      });
  }

  /**
   * The top and floor of the scale and every tick with room between them, inside the right edge of the
   * plot, where the fewest bars are. The unit goes on the top label only.
   */
  private drawYAxisLabels(
    context: CanvasRenderingContext2D,
    scale: Scale,
    ticks: number[],
    toY: (mbps: number) => number,
    top: number,
    bottom: number,
    plotRight: number,
  ): void {
    const topY = top + 4;
    const floorY = bottom - 6;
    const labels: [string, number][] = [
      [`${formatMbps(scale.topMbps)} Mbps`, topY],
      [formatTick(scale.floorMbps), floorY],
    ];
    let lastY = floorY;
    ticks.forEach(tick => {
      const y = toY(tick);
      if (lastY - y >= MIN_TICK_SPACING && y - topY >= MIN_TICK_SPACING) {
        labels.push([formatTick(tick), y]);
        lastY = y;
      }
    });
    labels.forEach(([text, y]) =>
      drawBackedText(context, text, plotRight - Y_LABEL_INSET - context.measureText(text).width, y, LABEL_COLOR),
    );
  }

  /**
   * The band's name in the label column, then the last download, and the average and highest of the
   * bars on screen. Readings are dropped from the right until the caption fits.
   */
  private drawCaption(
    context: CanvasRenderingContext2D,
    frame: GraphFrame,
    geometry: PlotGeometry,
    band: Band,
    samples: Sample[],
    visible: Sample[],
    y: number,
  ): void {
    const plotRight = geometry.plotLeft + geometry.plotWidth;
    context.fillStyle = band.color;
    context.fillText(band.mediaType, geometry.labelLeft, y);
    const noteWidth = context.measureText(SCALE_NOTE).width;
    context.fillStyle = LABEL_COLOR;
    context.fillText(SCALE_NOTE, plotRight - noteWidth, y);

    const left = Math.max(geometry.plotLeft, geometry.labelLeft + context.measureText(band.mediaType).width + 6);
    const available = plotRight - noteWidth - 6 - left;
    const unsized = frame.unsized[band.mediaType] ?? 0;
    let text = 'no downloads';
    if (band.mediaType === 'audio' && frame.state.muxedAudio) {
      text = MUXED_NOTE;
    } else if (unsized > 0) {
      text = UNSIZED_NOTE;
    }

    if (samples.length > 0) {
      const readings = [`last ${formatMbps(samples[samples.length - 1].mbps)}`];
      if (visible.length > 0) {
        const values = visible.map(sample => sample.mbps);
        readings.push(`avg ${formatMbps(values.reduce((sum, value) => sum + value, 0) / values.length)}`);
        readings.push(`max ${formatMbps(Math.max(...values))}`);
      }
      const unsizedReading = unsized > 0 ? ` · ${unsized} without size` : '';
      for (let count = readings.length; count >= 1; count--) {
        text = `${readings.slice(0, count).join(' · ')} Mbps${count === readings.length ? unsizedReading : ''}`;
        if (context.measureText(text).width <= available) {
          break;
        }
      }
    }

    context.fillStyle = VALUE_COLOR;
    context.fillText(text, left, y);
  }

  /** The rungs near the pointer, with their bitrates, in a box at the right edge of the plot. */
  private drawTooltip(context: CanvasRenderingContext2D, geometry: PlotGeometry, height: number): void {
    const hoverY = this.hoverY;
    const lines = this.rungHits
      .filter(hit => hoverY != null && Math.abs(hit.y - hoverY) <= RUNG_HOVER_RADIUS)
      .map(hit => hit.text);
    if (lines.length === 0) {
      return;
    }

    context.font = FONT;
    const boxWidth = Math.max(...lines.map(line => context.measureText(line).width)) + 2 * TOOLTIP_PADDING;
    const boxHeight = lines.length * TOOLTIP_LINE_HEIGHT + 2 * TOOLTIP_PADDING;
    const right = geometry.plotLeft + geometry.plotWidth - 2;
    const left = Math.max(geometry.plotLeft, right - boxWidth);
    const top = Math.min(Math.max(0, hoverY - boxHeight / 2), Math.max(0, height - boxHeight));
    context.fillStyle = TOOLTIP_BACKGROUND;
    context.fillRect(left, top, boxWidth, boxHeight);
    context.strokeStyle = TOOLTIP_BORDER;
    context.strokeRect(left + 0.5, top + 0.5, boxWidth - 1, boxHeight - 1);
    context.fillStyle = VALUE_COLOR;
    lines.forEach((line, index) =>
      context.fillText(line, left + TOOLTIP_PADDING, top + TOOLTIP_PADDING + TOOLTIP_LINE_HEIGHT * (index + 0.5)),
    );
  }
}

/**
 * A band for each media type the source has renditions of, or both while none are known. A source
 * with muxed audio keeps the audio band to say so, and a band with bars is always drawn.
 */
function isBandShown(band: Band, frame: GraphFrame, samples: Sample[]): boolean {
  return (
    frame.renditions.length === 0 ||
    frame.renditions.some(rendition => rendition.mediaType === band.mediaType) ||
    (band.mediaType === 'audio' && frame.state.muxedAudio) ||
    samples.some(sample => sample.mediaType === band.mediaType)
  );
}

/** The rungs of a media type, ascending. Renditions at one bitrate share a rung, named for all of them. */
function resolveLadder(frame: GraphFrame, mediaType: SegmentMediaType): Rung[] {
  const activeId = activeRenditionOf(frame, mediaType);
  const rungs: Rung[] = [];
  frame.renditions
    .filter(rendition => rendition.mediaType === mediaType && rendition.bitrate > 0)
    .sort((left, right) => left.bitrate - right.bitrate)
    .forEach(rendition => {
      const mbps = rendition.bitrate / 1e6;
      const label = rendition.label || `${formatMbps(mbps)} Mbps`;
      const active = rendition.id === activeId;
      const previous = rungs[rungs.length - 1];
      if (previous?.mbps === mbps) {
        previous.label = `${previous.label} / ${label}`;
        previous.active = previous.active || active;
      } else {
        rungs.push({ mbps, label, active });
      }
    });

  return rungs;
}

/**
 * The top is the highest bar or rung. The floor is below the lower of the bars' 10th percentile and
 * the bottom rung, rounded down to 1, 2 or 5 of its decade, and at least a decade below the top.
 */
function resolveScale(barsMbps: number[], rungsMbps: number[]): Scale {
  const topMbps = Math.max(0, ...barsMbps, ...rungsMbps) || 1;
  const sorted = barsMbps.slice().sort((left, right) => left - right);
  const percentile = sorted.length > 0 ? sorted[Math.floor(FLOOR_PERCENTILE * sorted.length)] : Infinity;
  const lowest = Math.min(percentile, rungsMbps[0] ?? Infinity);
  const floor = Math.min(lowest / FLOOR_HEADROOM, topMbps / 10);
  const magnitude = Math.pow(10, Math.floor(Math.log10(floor)));

  return { floorMbps: [5, 2, 1].map(multiple => multiple * magnitude).find(value => value <= floor), topMbps };
}

/** Where `mbps` falls between the floor (0) and the top (1) of the scale, clamped to the band. */
function logFraction(mbps: number, scale: Scale): number {
  const fraction =
    (Math.log10(mbps) - Math.log10(scale.floorMbps)) / (Math.log10(scale.topMbps) - Math.log10(scale.floorMbps));

  return Math.min(1, Math.max(0, fraction));
}

/** The gridlines strictly between the floor and the top: 1, 2 and 5 of each decade. */
function resolveTicks(scale: Scale): number[] {
  const ticks: number[] = [];
  for (let decade = Math.floor(Math.log10(scale.floorMbps)); decade <= Math.ceil(Math.log10(scale.topMbps)); decade++) {
    [1, 2, 5]
      .map(multiple => multiple * Math.pow(10, decade))
      .filter(mbps => mbps > scale.floorMbps && mbps < scale.topMbps)
      .forEach(mbps => ticks.push(mbps));
  }

  return ticks;
}

/** Text on a dark backing, so a rung or grid line at the same height does not run through it. Returns its right edge. */
function drawBackedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): number {
  const textWidth = context.measureText(text).width;
  context.fillStyle = LABEL_BACKING;
  context.fillRect(x - 2, y - Y_LABEL_BACKING_HALF_HEIGHT, textWidth + 4, Y_LABEL_BACKING_HALF_HEIGHT * 2);
  context.fillStyle = color;
  context.fillText(text, x, y);

  return x + textWidth;
}

/** `1 2 5` and `0.2 0.5`: only the decimals a tick needs. */
function formatTick(mbps: number): string {
  return mbps >= 1 ? String(Math.round(mbps)) : mbps.toFixed(-Math.floor(Math.log10(mbps)));
}

function formatMbps(mbps: number): string {
  return mbps >= DECIMAL_PLACE_LIMIT_MBPS ? String(Math.round(mbps)) : mbps.toFixed(1);
}

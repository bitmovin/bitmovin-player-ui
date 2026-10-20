import { mediaSpan, SegmentMediaType, SegmentRecord } from '../../../utils/SegmentHistory';
import { ComponentConfig } from '../../Component';
import {
  drawVerticalLine,
  GraphCanvas,
  GraphFrame,
  isOnPlot,
  LABEL_COLOR,
  LIVE_EDGE_COLOR,
  LIVE_EDGE_DASH,
  PlotGeometry,
  toX,
} from './GraphCanvas';

const PADDING = 6;
const BAND_CAPTION_HEIGHT = 18;
const BAND_HEIGHT = 80;
const BAND_GAP = 12;
const Y_LABEL_INSET = 4;
const DECIMAL_PLACE_LIMIT_MBPS = 100;
const MUXED_NOTE = 'muxed into the video segments';
const UNSIZED_NOTE = 'downloads report no size (chunked transfer)';
const BAND_BACKGROUND = 'rgba(255, 255, 255, 0.04)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.22)';
const VALUE_COLOR = 'rgba(255, 255, 255, 0.85)';
const PLAYHEAD_COLOR = 'rgba(255, 255, 255, 0.45)';

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

/**
 * Plots the measured download throughput of each segment as a bar under the segment's span on the
 * segment timeline, in one band per media type with its own scale. Audio runs an order of magnitude
 * below video, so on a shared scale it would sit on the baseline.
 *
 * @category Components
 */
export class DownloadSpeedGraph extends GraphCanvas {
  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, { cssClass: 'ui-player-graphs-download-speed' }, this.config);
  }

  /** Repaints the graph on the x axis of the segment timeline. Without that axis, nothing is drawn. */
  render(frame: GraphFrame, geometry: PlotGeometry | null): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const samples = frame.records.filter((record): record is Sample => record.mbps != null);
    const bands = BANDS.filter(band => isBandShown(band, frame, samples));
    const width = this.getCssWidth();
    const height = PADDING * 2 + bands.length * (BAND_CAPTION_HEIGHT + BAND_HEIGHT) + (bands.length - 1) * BAND_GAP;
    this.resize(context, width, height);
    if (!geometry) {
      return;
    }

    bands.forEach((band, index) => {
      const top = PADDING + index * (BAND_CAPTION_HEIGHT + BAND_HEIGHT + BAND_GAP);
      this.drawBand(
        context,
        frame,
        geometry,
        band,
        top,
        width,
        samples.filter(sample => sample.mediaType === band.mediaType),
      );
    });

    const playheadX = toX(geometry, frame.currentTime);
    if (isOnPlot(geometry, playheadX)) {
      drawVerticalLine(context, playheadX, PADDING, height - PADDING, PLAYHEAD_COLOR);
    }
    const liveEdge = frame.state.liveEdge;
    if (liveEdge != null && Number.isFinite(liveEdge) && isOnPlot(geometry, toX(geometry, liveEdge))) {
      drawVerticalLine(context, toX(geometry, liveEdge), PADDING, height - PADDING, LIVE_EDGE_COLOR, LIVE_EDGE_DASH);
    }
  }

  private drawBand(
    context: CanvasRenderingContext2D,
    frame: GraphFrame,
    geometry: PlotGeometry,
    band: Band,
    bandTop: number,
    width: number,
    samples: Sample[],
  ): void {
    const top = bandTop + BAND_CAPTION_HEIGHT;
    const bottom = top + BAND_HEIGHT;
    const plotRight = geometry.plotLeft + geometry.plotWidth;
    const windowEnd = geometry.windowStart + geometry.windowSeconds;
    const visible = samples.filter(sample => {
      const span = mediaSpan(sample);
      return span.end > geometry.windowStart && span.start < windowEnd;
    });
    const topMbps = Math.max(0, ...visible.map(sample => sample.mbps)) || 1;
    const toY = (mbps: number) => bottom - (Math.min(mbps, topMbps) / topMbps) * BAND_HEIGHT;

    context.fillStyle = BAND_BACKGROUND;
    context.fillRect(0, bandTop, width, BAND_CAPTION_HEIGHT + BAND_HEIGHT + 2);
    context.strokeStyle = AXIS_COLOR;
    context.beginPath();
    context.moveTo(geometry.plotLeft, Math.round(bottom) + 0.5);
    context.lineTo(plotRight, Math.round(bottom) + 0.5);
    context.stroke();

    // One gradient for the band rather than one per bar, so two bars of the same height shade alike.
    const fill = context.createLinearGradient(0, top, 0, bottom);
    fill.addColorStop(0, band.fillTop);
    fill.addColorStop(1, band.fillBottom);
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
    });

    const topLabel = `${formatMbps(topMbps)} Mbps`;
    context.fillStyle = LABEL_COLOR;
    context.fillText(topLabel, plotRight - Y_LABEL_INSET - context.measureText(topLabel).width, top + 4);
    this.drawCaption(context, frame, geometry, band, samples, visible, bandTop + BAND_CAPTION_HEIGHT / 2);
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
    context.fillStyle = band.color;
    context.fillText(band.mediaType, geometry.labelLeft, y);

    const left = Math.max(geometry.plotLeft, geometry.labelLeft + context.measureText(band.mediaType).width + 6);
    const available = geometry.plotLeft + geometry.plotWidth - left;
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

function formatMbps(mbps: number): string {
  return mbps >= DECIMAL_PLACE_LIMIT_MBPS ? String(Math.round(mbps)) : mbps.toFixed(1);
}

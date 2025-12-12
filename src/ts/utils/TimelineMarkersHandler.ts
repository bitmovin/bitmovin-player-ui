import { PlayerAPI, TimeRange } from 'bitmovin-player';
import { UIInstanceManager } from '../UIManager';
import { DOM } from '../DOM';
import { ComponentConfig } from '../components/Component';
import { TimelineMarker } from '../UIConfig';
import { SeekBar, SeekBarMarker, SeekPreviewEventArgs } from '../components/seekbar/SeekBar';
import { PlayerUtils } from './PlayerUtils';
import { Timeout } from './Timeout';
import { prefixCss } from '../components/DummyComponent';

const defaultMarkerUpdateIntervalMs = 1000;

/**
 * @category Configs
 */
export interface MarkersConfig extends ComponentConfig {
  /**
   * Used for seekBar marker snapping range percentage
   */
  snappingRange?: number;

  /**
   * The interval in milliseconds in which marker positions will be updated for live streams.
   * Default: 1000
   */
  markerUpdateIntervalMs?: number;
}

export class TimelineMarkersHandler {
  private markersContainer: DOM;
  private timelineMarkers: SeekBarMarker[];
  private player: PlayerAPI;
  private uimanager: UIInstanceManager;
  private markerPositionUpdater: Timeout | null = null;
  private getSeekBarWidth: () => number;
  protected config: MarkersConfig;
  private isTimeShifting: boolean = false;
  // On some platforms, there are inconsistencies between the timeShift and currentTime values during time-shifting
  // in a live stream. Those values are used to calculate a seekable-range during a live stream.
  // To properly calculate the marker position, we rely on the seekable range of the DVR window.
  // To work around the mentioned inconsistencies, we store the last known seekableRange and use
  // it for marker position calculation during time-shifting/scrubbing.
  private seekableRangeSnapshot: { start: number; end: number; timestampMs: number } | null = null;

  constructor(config: MarkersConfig, getSeekBarWidth: () => number, markersContainer: DOM) {
    this.config = config;
    this.getSeekBarWidth = getSeekBarWidth;
    this.markersContainer = markersContainer;
    this.timelineMarkers = [];
  }

  public initialize(player: PlayerAPI, uimanager: UIInstanceManager) {
    this.player = player;
    this.uimanager = uimanager;
    this.configureMarkers();
  }

  private configureMarkers(): void {
    const onTimeShift = () => {
      this.isTimeShifting = true;
    };

    const onTimeShifted = () => {
      this.isTimeShifting = false;
    };

    const onSeekPreview = (_: SeekBar, args: SeekPreviewEventArgs) => {
      if (args.scrubbing) {
        onTimeShift();
      }
    };

    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, () => {
      this.stopLiveMarkerUpdater();
      this.clearMarkers();
      this.isTimeShifting = false;

      this.player.off(this.player.exports.PlayerEvent.TimeShift, onTimeShift);
      this.player.off(this.player.exports.PlayerEvent.TimeShifted, onTimeShifted);
      this.uimanager.onSeekPreview.unsubscribe(onSeekPreview);
    });

    this.player.on(this.player.exports.PlayerEvent.AdBreakStarted, () => this.clearMarkers());
    this.player.on(this.player.exports.PlayerEvent.AdBreakFinished, () => this.updateMarkers());

    const liveStreamDetector = new PlayerUtils.LiveStreamDetector(this.player, this.uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: PlayerUtils.LiveStreamDetectorEventArgs) => {
      if (args.live) {
        this.player.on(this.player.exports.PlayerEvent.TimeShift, onTimeShift);
        this.player.on(this.player.exports.PlayerEvent.TimeShifted, onTimeShifted);
        this.uimanager.onSeekPreview.subscribe(onSeekPreview);

        this.startLiveMarkerUpdater();
      }
    });
    liveStreamDetector.detect(); // Initial detection

    this.uimanager.getConfig().events.onUpdated.subscribe(() => this.updateMarkers());
    this.uimanager.onRelease.subscribe(() =>
      this.uimanager.getConfig().events.onUpdated.unsubscribe(() => this.updateMarkers()),
    );

    // Refresh the playback position when the player resized or the UI is configured. The playback position marker
    // is positioned absolutely and must therefore be updated when the size of the seekbar changes.
    this.player.on(this.player.exports.PlayerEvent.PlayerResized, () => this.updateMarkersDOM());
    // Additionally, when this code is called, the seekbar is not part of the UI yet and therefore does not have a size,
    // resulting in a wrong initial position of the marker. Refreshing it once the UI is configured solved this issue.
    this.uimanager.onConfigured.subscribe(() => {
      this.updateMarkers();
    });
    this.player.on(this.player.exports.PlayerEvent.SourceLoaded, () => {
      this.updateMarkers();
    });

    // Init markers at startup
    this.updateMarkers();
  }

  public getMarkerAtPosition(percentage: number): SeekBarMarker | null {
    const snappingRange = this.config.snappingRange;

    const matchingMarker = this.timelineMarkers.find(marker => {
      const hasDuration = marker.duration > 0;
      // Handle interval markers
      const intervalMarkerMatch =
        hasDuration &&
        percentage >= marker.position - snappingRange &&
        percentage <= marker.position + marker.duration + snappingRange;

      // Handle position markers
      const positionMarkerMatch =
        percentage >= marker.position - snappingRange && percentage <= marker.position + snappingRange;

      return intervalMarkerMatch || positionMarkerMatch;
    });

    return matchingMarker || null;
  }

  private clearMarkers(): void {
    this.timelineMarkers = [];
    this.markersContainer.empty();
  }

  private removeMarkerFromConfig(marker: TimelineMarker): void {
    this.uimanager.getConfig().metadata.markers = this.uimanager
      .getConfig()
      .metadata.markers.filter(_marker => marker !== _marker);
  }

  private filterRemovedMarkers(): void {
    this.timelineMarkers = this.timelineMarkers.filter(seekbarMarker => {
      const matchingMarker = this.uimanager
        .getConfig()
        .metadata.markers.find(_marker => seekbarMarker.marker === _marker);
      if (!matchingMarker) {
        this.removeMarkerFromDOM(seekbarMarker);
      }
      return matchingMarker;
    });
  }

  private removeMarkerFromDOM(marker: SeekBarMarker): void {
    if (marker.element) {
      marker.element.remove();
    }
  }

  private updateMarkers(): void {
    const seekBarWidth = this.getSeekBarWidth();
    if (seekBarWidth === 0) {
      // Skip marker update when the seekBarWidth is not yet available.
      // Will be updated by PlayerResized/onConfigured events once dimensions are available.
      return;
    }

    if (!shouldProcessMarkers(this.player, this.uimanager)) {
      this.clearMarkers();
      return;
    }

    this.filterRemovedMarkers();

    this.uimanager.getConfig().metadata.markers.forEach(marker => {
      const { markerPosition, markerDuration } = getMarkerPositions(
        this.player,
        this.getSeekableRangeRespectingSnapshot(),
        marker,
      );

      if (shouldRemoveMarker(markerPosition, markerDuration)) {
        this.removeMarkerFromConfig(marker);
      } else if (markerPosition <= 100) {
        const matchingMarker = this.timelineMarkers.find(seekbarMarker => seekbarMarker.marker === marker);

        if (matchingMarker) {
          matchingMarker.position = markerPosition;
          matchingMarker.duration = markerDuration;

          this.updateMarkerDOM(matchingMarker);
        } else {
          const newMarker: SeekBarMarker = { marker, position: markerPosition, duration: markerDuration };
          this.timelineMarkers.push(newMarker);

          this.createMarkerDOM(newMarker);
        }
      }
    });
  }

  private getMarkerCssProperties(
    marker: SeekBarMarker,
    includeTransition: boolean = true,
  ): { [propertyName: string]: string } {
    const seekBarWidthPx = this.getSeekBarWidth();

    const positionInPx = (seekBarWidthPx / 100) * (marker.position < 0 ? 0 : marker.position);
    const cssProperties: { [propertyName: string]: string } = {
      transform: `translateX(${positionInPx}px)`,
    };

    if (includeTransition) {
      const updateIntervalMs = this.config.markerUpdateIntervalMs || defaultMarkerUpdateIntervalMs;
      cssProperties['transition-duration'] = `${updateIntervalMs}ms`;
    } else {
      cssProperties['transition'] = 'none';
    }

    if (marker.duration > 0) {
      const markerWidthPx = Math.round((seekBarWidthPx / 100) * marker.duration);
      cssProperties['width'] = `${markerWidthPx}px`;
    }

    return cssProperties;
  }

  private updateMarkerDOM(marker: SeekBarMarker): void {
    // Removing the 'transition: none' value from the initial creation when updating the marker position.
    marker.element.removeCss('transition');
    marker.element.css(this.getMarkerCssProperties(marker, true));
  }

  private createMarkerDOM(marker: SeekBarMarker): void {
    const markerClasses = ['seekbar-marker']
      .concat(marker.marker.cssClasses || [])
      .map(cssClass => prefixCss(cssClass));

    const markerStartIndicator = new DOM('div', {
      class: prefixCss('seekbar-marker-indicator'),
    });

    const markerEndIndicator = new DOM('div', {
      class: prefixCss('seekbar-marker-indicator'),
    });

    const markerElement = new DOM('div', {
      class: markerClasses.join(' '),
      'data-marker-time': String(marker.marker.time),
      'data-marker-title': String(marker.marker.title),
    })
      // We do not want to animate the initial creation of a marker to prevent a 'fly in' animation.
      // Only updating the marker position will be animated.
      .css(this.getMarkerCssProperties(marker, false));

    if (marker.marker.imageUrl) {
      const removeImage = () => {
        imageElement.remove();
      };

      const imageElement = new DOM('img', {
        class: prefixCss('seekbar-marker-image'),
        src: marker.marker.imageUrl,
      }).on('error', removeImage);

      markerElement.append(imageElement);
    }

    markerElement.append(markerStartIndicator);

    if (marker.duration > 0) {
      markerElement.append(markerEndIndicator);
    }

    marker.element = markerElement;
    this.markersContainer.append(markerElement);
  }

  private updateMarkersDOM(): void {
    this.timelineMarkers.forEach(marker => {
      if (marker.element) {
        this.updateMarkerDOM(marker);
      } else {
        this.createMarkerDOM(marker);
      }
    });
  }

  private startLiveMarkerUpdater(): void {
    const updateIntervalMs = this.config.markerUpdateIntervalMs || defaultMarkerUpdateIntervalMs;

    this.stopLiveMarkerUpdater();
    this.captureSeekableRangeSnapshot();

    this.markerPositionUpdater = new Timeout(
      updateIntervalMs,
      () => {
        if (!this.isTimeShifting) {
          this.captureSeekableRangeSnapshot();
        }

        this.updateMarkers();
      },
      true,
    );

    this.markerPositionUpdater.start();
  }

  private stopLiveMarkerUpdater(): void {
    if (this.markerPositionUpdater) {
      this.markerPositionUpdater.clear();
      this.markerPositionUpdater = null;
    }
  }

  private captureSeekableRangeSnapshot(): void {
    const seekableRange = PlayerUtils.getSeekableRangeRespectingLive(this.player);

    this.seekableRangeSnapshot = {
      start: seekableRange.start,
      end: seekableRange.end,
      timestampMs: Date.now(),
    };
  }

  private getSeekableRangeRespectingSnapshot(): TimeRange {
    const seekableRange = PlayerUtils.getSeekableRangeRespectingLive(this.player);

    if (!this.player.isLive()) {
      return seekableRange;
    }

    if (this.isTimeShifting && this.seekableRangeSnapshot) {
      // Interpolate the last snapshot so the sliding DVR window keeps moving while time-shifting.
      const elapsedSeconds = (Date.now() - this.seekableRangeSnapshot.timestampMs) / 1000;
      return {
        start: this.seekableRangeSnapshot.start + elapsedSeconds,
        end: this.seekableRangeSnapshot.end + elapsedSeconds,
      };
    }

    return seekableRange;
  }
}

function getMarkerPositions(player: PlayerAPI, seekableRange: TimeRange, marker: TimelineMarker) {
  const duration = getDuration(player, seekableRange);

  const markerPosition = (100 / duration) * getMarkerTime(marker, player, duration, seekableRange); // convert absolute time to percentage
  let markerDuration = (100 / duration) * marker.duration;

  if (markerPosition < 0 && !isNaN(markerDuration)) {
    // Shrink marker duration for on live streams as they reach end
    markerDuration = markerDuration + markerPosition;
  }

  if (100 - markerPosition < markerDuration) {
    // Shrink marker if it overflows timeline
    markerDuration = 100 - markerPosition;
  }

  return { markerDuration, markerPosition };
}

function getMarkerTime(marker: TimelineMarker, player: PlayerAPI, duration: number, seekableRange: TimeRange): number {
  if (!player.isLive()) {
    return marker.time;
  }

  return duration - (seekableRange.end - marker.time);
}

function getDuration(player: PlayerAPI, seekableRange: TimeRange): number {
  if (!player.isLive()) {
    return player.getDuration();
  }
  const { start, end } = seekableRange;

  return end - start;
}

function shouldRemoveMarker(markerPosition: number, markerDuration: number): boolean {
  return (markerDuration < 0 || isNaN(markerDuration)) && markerPosition < 0;
}

function shouldProcessMarkers(player: PlayerAPI, uimanager: UIInstanceManager): boolean {
  // Don't generate timeline markers if we don't yet have a duration
  // The duration check is for buggy platforms where the duration is not available instantly (Chrome on Android 4.3)
  const validToProcess = player.getDuration() !== Infinity || player.isLive();
  const hasMarkers = uimanager.getConfig().metadata.markers.length > 0;

  return validToProcess && hasMarkers;
}

import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { DOM } from '../dom';
import { ComponentConfig } from './component';
import { TimelineMarker } from '../uiconfig';
import { SeekBarMarker } from './seekbar';
import { PlayerUtils } from '../playerutils';
import { Timeout } from '../timeout';

export interface MarkersConfig extends ComponentConfig {
  /**
   * Used for seekBar marker snapping range percentage
   */
  snappingRange?: number;
}

export class TimelineMarkersHandler {
  private markersContainer: DOM;
  private timelineMarkers: SeekBarMarker[];
  private player: PlayerAPI;
  private uimanager: UIInstanceManager;
  private pausedTimeshiftUpdater: Timeout;
  private getSeekBarWidth: () => number;
  protected config: MarkersConfig;

  constructor(config: MarkersConfig, getSeekBarWidth: () => number, markersContainer: DOM) {
    this.config = config;
    this.getSeekBarWidth = getSeekBarWidth;
    this.markersContainer = markersContainer;
  }

  public initialize(player: PlayerAPI, uimanager: UIInstanceManager) {
    this.player = player;
    this.uimanager = uimanager;
    this.configureMarkers();
  }

  private configureMarkers(): void {
    // Remove markers when unloaded
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, () => this.clearMarkers());
    // Update markers when the size of the seekbar changes
    this.player.on(this.player.exports.PlayerEvent.PlayerResized, () => this.updateMarkersDOM());

    this.player.on(this.player.exports.PlayerEvent.SourceLoaded, () => {
      if (this.player.isLive()) {
        // Update marker position as timeshift range changes
        this.player.on(this.player.exports.PlayerEvent.TimeChanged, () => this.updateMarkers());
        // Update marker postion when paused as timeshift range changes
        this.configureLivePausedTimeshiftUpdater(() => this.updateMarkers());
      }
    });
    this.uimanager.getConfig().events.onUpdated.subscribe(() => this.updateMarkers());
    this.uimanager.onRelease.subscribe(() => this.uimanager.getConfig().events.onUpdated.unsubscribe(() => this.updateMarkers()));

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
        percentage >= marker.position - snappingRange &&
        percentage <= marker.position + snappingRange;

      return intervalMarkerMatch || positionMarkerMatch;
    });

    return matchingMarker || null;
  }

  private clearMarkers(): void {
    this.timelineMarkers = [];
    this.markersContainer.get()[0].innerHTML = '';
  }

  private removeMarkerFromConfig(marker: TimelineMarker): void {
    this.uimanager.getConfig().metadata.markers = this.uimanager.getConfig().metadata.markers.filter(_marker => marker !== _marker);
  }

  private filterRemovedMarkers(): void {
    this.timelineMarkers = this.timelineMarkers.filter(seekbarMarker => {
      const matchingMarker = this.uimanager.getConfig().metadata.markers.find(_marker =>  seekbarMarker.marker === _marker);
      if (!matchingMarker) {
        this.removeMarkerFromDOM(seekbarMarker);
      }
      return matchingMarker;
    });
  }

  private removeMarkerFromDOM(marker: SeekBarMarker): void {
    if (marker.element) {
      const element = marker.element.get()[0];
      element.parentElement.removeChild(element);
    }
  }

  private updateMarkers(): void {
    if (!shouldProcessMarkers(this.player, this.uimanager)) {
      this.clearMarkers();
      return;
    }

    this.filterRemovedMarkers();

    this.uimanager.getConfig().metadata.markers.forEach(marker => {
      const { markerPosition, markerDuration } = getMarkerPositions(this.player, marker);

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

  private getMarkerCssProperties(marker: SeekBarMarker): { [propertyName: string]: string } {
    const seekBarWidthPx = this.getSeekBarWidth();

    const cssProperties: { [propertyName: string]: string } = {
      'left': `${marker.position < 0 ? 0 : marker.position}%`,
    };

    if (marker.duration > 0) {
      const markerWidthPx = Math.round(seekBarWidthPx / 100 * marker.duration);
      cssProperties['width'] = `${markerWidthPx}px`;
    }

    return cssProperties;
  }

  private updateMarkerDOM(marker: SeekBarMarker): void {
    marker.element.css(this.getMarkerCssProperties(marker));
  }

  private createMarkerDOM(marker: SeekBarMarker): void {
      const markerClasses = ['seekbar-marker'].concat(marker.marker.cssClasses || [])
        .map(cssClass => this.prefixCss(cssClass));

      const markerElement = new DOM('div', {
        'class': markerClasses.join(' '),
        'data-marker-time': String(marker.marker.time),
        'data-marker-title': String(marker.marker.title),
      }).css(this.getMarkerCssProperties(marker));

      if (marker.marker.imageUrl) {
        const removeImage = () => {
          const toRemove = imageElement.get()[0];
          toRemove.parentElement.removeChild(toRemove);
        };

        const imageElement = new DOM('img', {
          'class': this.prefixCss('seekbar-marker-image'),
          'src': marker.marker.imageUrl,
        }).on('error', removeImage);

        markerElement.append(imageElement);
        marker.element = markerElement;
      }

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

  private configureLivePausedTimeshiftUpdater(
    handler: () => void,
  ): void {
    // Regularly update the marker position while the timeout is active
    this.pausedTimeshiftUpdater = new Timeout(1000, handler, true);

    this.player.on(this.player.exports.PlayerEvent.Paused, () => {
      if (this.player.isLive() && this.player.getMaxTimeShift() < 0) {
        this.pausedTimeshiftUpdater.start();
      }
    });

    // Stop updater when playback continues (no matter if the updater was started before)
    this.player.on(this.player.exports.PlayerEvent.Play, () => this.pausedTimeshiftUpdater.clear());
  }

  protected prefixCss(cssClassOrId: string): string {
    return this.config.cssPrefix + '-' + cssClassOrId;
  }
}

function getMarkerPositions(player: PlayerAPI, marker: TimelineMarker) {
  const duration = getDuration(player);

  let markerPosition = 100 / duration * getMarkerTime(marker, player, duration); // convert absolute time to percentage
  let markerDuration = 100 / duration * marker.duration;

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

function getMarkerTime(marker: TimelineMarker, player: PlayerAPI, duration: number): number {
  if (!player.isLive()) {
    return marker.time;
  }

  return duration - (PlayerUtils.getSeekableRangeRespectingLive(player).end - marker.time);
}

function getDuration(player: PlayerAPI): number {
  if (!player.isLive()) {
    return player.getDuration();
  }
  const { start, end } = PlayerUtils.getSeekableRangeRespectingLive(player);

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

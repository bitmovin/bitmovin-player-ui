import { AdBreakEvent, PlayerAPI } from 'bitmovin-player';
import { Event, EventDispatcher } from '../EventDispatcher';

export interface AdBreakTrackerChangedArgs {
  currentAdIndex: number;
  totalNumberOfAds: number;
}

/**
 * Tracks a group of ad breaks that share the same `scheduleTime`, enabling a unified ad counter
 * across what the player models as separate ad breaks.
 *
 * When multiple ad breaks are scheduled at the same position, the player fires separate
 * `AdBreakStarted`/`AdBreakFinished` events for each. This tracker accumulates state across those
 * events and dispatches {@link onChanged} after each update so callers can derive a group-wide
 * `currentAdIndex` and `totalNumberOfAds` to pass to
 * {@link StringUtils.replaceAdMessagePlaceholders}.
 *
 * @category Utils
 */
export class AdBreakTracker {
  // Number of ads from co-scheduled ad breaks that have already finished.
  private adIndexOffsetOfPreviousBreaks: number = 0;
  // Index of the currently playing ad across all co-scheduled ad breaks (1-based)
  private currentAdIndexAcrossBreaks: number = 0;
  // Total ad count across the group of co-scheduled ad breaks
  private totalNumberOfAdsAcrossBreaks: number = 0;
  // scheduleTime shared by the current group of co-scheduled ad breaks, or undefined when not in a group.
  private groupScheduleTime: number | undefined = undefined;
  // Ad count of the currently active break
  private numberOfAdsInCurrentAdBreak: number = 0;

  private readonly events = {
    onChanged: new EventDispatcher<AdBreakTracker, AdBreakTrackerChangedArgs>(),
  };

  constructor(private readonly player: PlayerAPI) {
    // Sibling ad break detection is done in `AdStarted` because the ad UI variant is not yet configured when
    // the `AdBreakStarted` event fires
    player.on(player.exports.PlayerEvent.AdStarted, this.handleAdStarted);
    player.on(player.exports.PlayerEvent.AdBreakFinished, this.handleAdBreakFinished);
  }

  get onChanged(): Event<AdBreakTracker, AdBreakTrackerChangedArgs> {
    return this.events.onChanged.getEvent();
  }

  /**
   * Index of the currently playing ad across all co-scheduled breaks (1-based), or 0 when no ad
   * is active.
   */
  get currentAdIndex(): number {
    return this.currentAdIndexAcrossBreaks;
  }

  /** Total ad count across all co-scheduled breaks in the current group. */
  get totalNumberOfAds(): number {
    return this.totalNumberOfAdsAcrossBreaks;
  }

  /** Unsubscribes all player events and resets state. Call when the tracker is no longer needed. */
  release(): void {
    this.player.off(this.player.exports.PlayerEvent.AdStarted, this.handleAdStarted);
    this.player.off(this.player.exports.PlayerEvent.AdBreakFinished, this.handleAdBreakFinished);
    this.reset();
    this.events.onChanged.unsubscribeAll();
  }

  private readonly handleAdStarted = (): void => {
    const activeBreak = this.player.ads?.getActiveAdBreak?.();
    if (!activeBreak) {
      this.reset();
      this.dispatchChanged();
      return;
    }

    // Note: `player.ads.list()` provides all ad breaks except past ad breaks or the currently active ad break
    const siblings = (this.player.ads?.list?.() ?? []).filter(b => b.scheduleTime === activeBreak.scheduleTime);

    const activeAd = this.player.ads?.getActiveAd?.();
    const ads = activeBreak.ads;

    // If ads are not yet loaded, assume 1 ad in the current break.
    this.numberOfAdsInCurrentAdBreak = Array.isArray(ads) && ads.length > 0 ? ads.length : 1;
    const withinBreakIndex =
      Array.isArray(ads) && activeAd
        ? ads.findIndex(ad => (activeAd.id != null && ad.id != null ? ad.id === activeAd.id : ad === activeAd))
        : -1;

    if (
      (this.adIndexOffsetOfPreviousBreaks > 0 && activeBreak.scheduleTime === this.groupScheduleTime) ||
      siblings.length > 0
    ) {
      this.groupScheduleTime = activeBreak.scheduleTime;
      this.currentAdIndexAcrossBreaks = withinBreakIndex + 1 + this.adIndexOffsetOfPreviousBreaks;
      // Sibling ads arrays may not be populated yet (VAST manifests load lazily), so we use the ads count if available,
      // or assume 1 ad per break if not available. It will update and self-correct with each AdStarted event.
      const remainingSiblingAdCount = siblings.reduce(
        (sum, adBreak) => sum + (adBreak.ads?.length > 0 ? adBreak.ads.length : 1),
        0,
      );
      this.totalNumberOfAdsAcrossBreaks =
        this.adIndexOffsetOfPreviousBreaks + this.numberOfAdsInCurrentAdBreak + remainingSiblingAdCount;
    } else {
      this.adIndexOffsetOfPreviousBreaks = 0;
      this.currentAdIndexAcrossBreaks = withinBreakIndex + 1;
      this.totalNumberOfAdsAcrossBreaks = this.numberOfAdsInCurrentAdBreak;
      this.groupScheduleTime = undefined;
    }

    this.dispatchChanged();
  };

  private readonly handleAdBreakFinished = (adBreakFinishedEvent: AdBreakEvent): void => {
    const adBreak = adBreakFinishedEvent.adBreak;

    if (adBreak.scheduleTime !== this.groupScheduleTime) {
      return;
    }

    const remainingSiblings = (this.player.ads?.list?.() ?? []).filter(b => b.scheduleTime === this.groupScheduleTime);

    if (remainingSiblings.length === 0) {
      this.reset();
    } else {
      this.adIndexOffsetOfPreviousBreaks += this.numberOfAdsInCurrentAdBreak;
      this.numberOfAdsInCurrentAdBreak = 0;
    }

    this.dispatchChanged();
  };

  private dispatchChanged(): void {
    this.events.onChanged.dispatch(this, {
      currentAdIndex: this.currentAdIndex,
      totalNumberOfAds: this.totalNumberOfAdsAcrossBreaks,
    });
  }

  private reset(): void {
    this.adIndexOffsetOfPreviousBreaks = 0;
    this.currentAdIndexAcrossBreaks = 0;
    this.totalNumberOfAdsAcrossBreaks = 0;
    this.groupScheduleTime = undefined;
    this.numberOfAdsInCurrentAdBreak = 0;
  }
}

import { Ad, AdBreak, AdBreakEvent, PlayerAPI } from 'bitmovin-player';
import { Event, EventDispatcher } from '../EventDispatcher';
import type { AdCountFilter } from '../UIConfig';

export interface AdBreakTrackerAdCountChangedArgs {
  currentAdIndex: number;
  totalNumberOfAds: number;
}

/**
 * Tracks subsequent ad breaks that share the same `scheduleTime`, enabling a unified ad counter
 * across what the player models as separate ad breaks.
 *
 * When multiple ad breaks are scheduled at the same position, the player fires separate
 * `AdBreakStarted`/`AdBreakFinished` events for each. This tracker retains the ad break objects
 * that the player removes from `player.ads.list()` after they finish, so that
 * {@link currentAdIndex} and {@link totalNumberOfAds} can be derived lazily from the retained
 * breaks plus the player's current state.
 *
 * @category Utils
 */
export class AdBreakTracker {
  // Ad breaks belonging to the current group, captured as each break starts.
  // The player removes finished breaks from `list()`, so we retain them here.
  private groupBreaks: { adBreak: AdBreak; lastActiveAd?: Ad }[] = [];
  // scheduleTime shared by the current group, or undefined when not in a group.
  private groupScheduleTime: number | undefined = undefined;

  private readonly events = {
    onAdCountChanged: new EventDispatcher<AdBreakTracker, AdBreakTrackerAdCountChangedArgs>(),
  };

  constructor(
    private readonly player: PlayerAPI,
    private readonly shouldCountAd: AdCountFilter = () => true,
  ) {
    // Subsequent ad break detection is done in `AdStarted` because the ad UI variant is not yet configured when
    // the `AdBreakStarted` event fires
    player.on(player.exports.PlayerEvent.AdStarted, this.handleAdStarted);
    player.on(player.exports.PlayerEvent.AdBreakFinished, this.handleAdBreakFinished);
  }

  get onAdCountChanged(): Event<AdBreakTracker, AdBreakTrackerAdCountChangedArgs> {
    return this.events.onAdCountChanged.getEvent();
  }

  /**
   * Index of the currently playing ad across all subsequent ad breaks (1-based), or 0 when no ad
   * is active or the active ad is excluded by the filter.
   */
  get currentAdIndex(): number {
    const activeAd = this.player.ads?.getActiveAd?.();
    if (!activeAd || this.groupBreaks.length === 0) {
      return 0;
    }

    const activeBreak = this.player.ads?.getActiveAdBreak?.();
    if (activeBreak && !this.shouldCountAd(activeAd, activeBreak)) {
      return 0;
    }

    let offset = 0;
    for (const { adBreak, lastActiveAd } of this.groupBreaks) {
      const ads = adBreak.ads ?? [];

      if (ads.length > 0) {
        // ad.id/activeAd.id may be null/undefined, in which case we fall back to object reference comparison
        const activeAdIndex = ads.findIndex(ad =>
          activeAd.id != null && ad.id != null ? ad.id === activeAd.id : ad === activeAd,
        );

        if (activeAdIndex >= 0) {
          return offset + ads.slice(0, activeAdIndex + 1).filter(ad => this.shouldCountAd(ad, adBreak)).length;
        }
      } else if (activeBreak === adBreak || (activeBreak?.id != null && activeBreak.id === adBreak.id)) {
        // Ads not yet populated — the active ad is the first ad of its break.
        return offset + 1;
      }

      offset += this.countAds(adBreak, lastActiveAd);
    }

    // Active ad not found in any retained break — fall back to offset + 1
    return offset + 1;
  }

  /** Total ad count across all subsequent ad breaks, excluding ads rejected by the filter. */
  get totalNumberOfAds(): number {
    if (this.groupBreaks.length === 0) {
      return 0;
    }

    const retainedCount = this.groupBreaks.reduce(
      (sum, { adBreak, lastActiveAd }) => sum + this.countAds(adBreak, lastActiveAd),
      0,
    );

    const remainingScheduledCount = (this.player.ads?.list?.() ?? [])
      .filter(b => b.scheduleTime === this.groupScheduleTime)
      .reduce((sum, adBreak) => sum + this.countAds(adBreak), 0);

    return retainedCount + remainingScheduledCount;
  }

  /** Unsubscribes all player events and resets state. Call when the tracker is no longer needed. */
  release(): void {
    this.player.off(this.player.exports.PlayerEvent.AdStarted, this.handleAdStarted);
    this.player.off(this.player.exports.PlayerEvent.AdBreakFinished, this.handleAdBreakFinished);
    this.reset();
    this.events.onAdCountChanged.unsubscribeAll();
  }

  private countAds(adBreak: AdBreak, lastActiveAd?: Ad): number {
    if (adBreak.ads?.length > 0) {
      return adBreak.ads.filter(ad => this.shouldCountAd(ad, adBreak)).length;
    }

    // Unloaded breaks provisionally count as one ad; retain the active ad for later offsets.
    return this.shouldCountAd(lastActiveAd, adBreak) ? 1 : 0;
  }

  private readonly handleAdStarted = (): void => {
    const activeBreak = this.player.ads?.getActiveAdBreak?.();
    if (!activeBreak) {
      this.reset();
      this.dispatchChanged();
      return;
    }

    const hasSubsequentBreaks = (this.player.ads?.list?.() ?? []).some(
      b => b.scheduleTime === activeBreak.scheduleTime,
    );
    const isPartOfExistingGroup = this.groupBreaks.length > 0 && activeBreak.scheduleTime === this.groupScheduleTime;
    const trackedBreak = { adBreak: activeBreak, lastActiveAd: this.player.ads?.getActiveAd?.() };

    if (isPartOfExistingGroup || hasSubsequentBreaks) {
      if (!isPartOfExistingGroup && this.groupBreaks.length > 0) {
        // New group at a different scheduleTime — clear stale state from a previous group
        this.groupBreaks = [];
      }

      this.groupScheduleTime = activeBreak.scheduleTime;

      // On mobile, the Player may deserialize a new object for the same break on every event,
      // so use the stable break ID instead of object identity for deduplication.
      const existingBreakIndex = this.groupBreaks.findIndex(({ adBreak }) =>
        activeBreak.id != null && adBreak.id != null ? adBreak.id === activeBreak.id : adBreak === activeBreak,
      );
      if (existingBreakIndex < 0) {
        this.groupBreaks.push(trackedBreak);
      } else {
        this.groupBreaks[existingBreakIndex] = trackedBreak;
      }
    } else {
      // Single ad break, not part of a group
      this.groupBreaks = [trackedBreak];
      this.groupScheduleTime = undefined;
    }

    this.dispatchChanged();
  };

  private readonly handleAdBreakFinished = (adBreakFinishedEvent: AdBreakEvent): void => {
    const adBreak = adBreakFinishedEvent.adBreak;

    if (adBreak.scheduleTime !== this.groupScheduleTime) {
      if (this.groupScheduleTime === undefined) {
        this.reset();
        this.dispatchChanged();
      }
      return;
    }

    const subsequentAdBreaks = (this.player.ads?.list?.() ?? []).filter(b => b.scheduleTime === this.groupScheduleTime);

    // The next break in the group may already be active (and thus removed from `list()`),
    // so also check whether the currently active break shares the same scheduleTime.
    const activeBreak = this.player.ads?.getActiveAdBreak?.();
    const activeBreakInGroup =
      activeBreak?.scheduleTime === this.groupScheduleTime && this.groupScheduleTime !== undefined;

    if (subsequentAdBreaks.length === 0 && !activeBreakInGroup) {
      this.reset();
      this.dispatchChanged();
    }
    // When more breaks remain in the group, skip dispatching — the next AdStarted will
    // dispatch up-to-date values. Between breaks there is no active ad, so the lazy
    // getters cannot produce meaningful values.
  };

  private dispatchChanged(): void {
    this.events.onAdCountChanged.dispatch(this, {
      currentAdIndex: this.currentAdIndex,
      totalNumberOfAds: this.totalNumberOfAds,
    });
  }

  private reset(): void {
    this.groupBreaks = [];
    this.groupScheduleTime = undefined;
  }
}

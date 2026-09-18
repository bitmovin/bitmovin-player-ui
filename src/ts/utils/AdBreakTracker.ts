import { Ad, AdBreak, AdBreakEvent, LinearAd, PlayerAPI } from 'bitmovin-player';
import { Event, EventDispatcher } from '../EventDispatcher';
import type { AdCountFilter } from '../UIConfig';

/**
 * An ad break retained by {@link AdBreakTracker}, reduced to the ads that the ad count filter includes.
 */
class TrackedAdBreak {
  constructor(
    readonly adBreak: AdBreak,
    private readonly shouldCountAd: AdCountFilter,
    // IF ads not yet populated — if this is the active break, the active ad is its first ad
    private readonly lastActiveAd?: Ad,
  ) {}

  get hasAds(): boolean {
    return this.ads.length > 0;
  }

  get countedAds(): number {
    if (!this.hasAds) {
      return this.counts(this.lastActiveAd) ? 1 : 0;
    }

    return this.countAdsUpTo(this.ads.length - 1);
  }

  countAdsUpTo(index: number): number {
    return this.countedAdsOf(this.ads.slice(0, index + 1)).length;
  }

  /** Total duration of the counted ads of this break, starting at `index`. */
  countedDurationFrom(index: number = 0): number {
    return this.countedAdsOf(this.ads.slice(index)).reduce((total, ad) => total + adDuration(ad), 0);
  }

  counts(ad: Ad): boolean {
    return this.shouldCountAd(ad, this.adBreak);
  }

  indexOfAd(ad: Ad): number {
    return this.ads.findIndex(breakAd => (breakAd.id != null && ad.id != null ? breakAd.id === ad.id : breakAd === ad));
  }

  /**
   * On mobile, the Player may deserialize a new object for the same break on
   * every event, so the stable break ID takes precedence over object identity.
   */
  isBreak(adBreak: AdBreak): boolean {
    return adBreak.id != null && this.adBreak.id != null ? this.adBreak.id === adBreak.id : this.adBreak === adBreak;
  }

  private get ads(): Ad[] {
    return this.adBreak.ads ?? [];
  }

  private countedAdsOf(ads: Ad[]): Ad[] {
    return ads.filter(ad => this.shouldCountAd(ad, this.adBreak));
  }
}

function adDuration(ad: Ad): number {
  return ad.isLinear ? (ad as LinearAd).duration : 0;
}

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
  private groupBreaks: TrackedAdBreak[] = [];
  // scheduleTime shared by the current group, or undefined when not in a group.
  private groupScheduleTime: number | undefined = undefined;

  private readonly events = {
    onAdCountChanged: new EventDispatcher<AdBreakTracker, AdBreakTrackerAdCountChangedArgs>(),
  };

  private readonly shouldCountAd: AdCountFilter;

  constructor(
    private readonly player: PlayerAPI,
    adCountFilter: AdCountFilter = () => true,
  ) {
    this.shouldCountAd = adCountFilter;

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
    for (const trackedBreak of this.groupBreaks) {
      const activeAdIndex = trackedBreak.indexOfAd(activeAd);
      if (activeAdIndex >= 0) {
        return offset + trackedBreak.countAdsUpTo(activeAdIndex);
      }

      // ads not yet populated — if this is the active break, the active ad is its first ad
      if (!trackedBreak.hasAds && activeBreak && trackedBreak.isBreak(activeBreak)) {
        return offset + 1;
      }

      offset += trackedBreak.countedAds;
    }

    // Active ad not found in any retained break — fall back to offset + 1
    return offset + 1;
  }

  /** Total ad count across all subsequent ad breaks, excluding ads rejected by the filter. */
  get totalNumberOfAds(): number {
    if (this.groupBreaks.length === 0) {
      return 0;
    }

    const retainedCount = this.groupBreaks.reduce((sum, trackedBreak) => sum + trackedBreak.countedAds, 0);

    const remainingScheduledCount = this.scheduledBreaksOfGroup().reduce(
      (sum, adBreak) => sum + this.track(adBreak).countedAds,
      0,
    );

    return retainedCount + remainingScheduledCount;
  }

  /**
   * Remaining playback time of the counted ads, including the ad breaks of the group that have not started yet, or 0
   * when no linear ad is active.
   *
   * Ads rejected by the filter are left out.
   */
  get adBreakRemainingTime(): number {
    const activeAd = this.player.ads?.getActiveAd?.();
    const activeBreak = this.player.ads?.getActiveAdBreak?.();
    if (!this.player.ads?.isLinearAdActive?.() || !activeAd || !activeBreak) {
      return 0;
    }

    const trackedActiveBreak = this.track(activeBreak);
    const activeAdIndex = trackedActiveBreak.indexOfAd(activeAd);
    const activeAdIsCounted = trackedActiveBreak.counts(activeAd);

    // When the active ad cannot be located in its break, only its own remaining time is known
    const remainingTimeOfActiveBreak =
      activeAdIndex >= 0
        ? trackedActiveBreak.countedDurationFrom(activeAdIndex)
        : activeAdIsCounted
          ? adDuration(activeAd)
          : 0;

    const remainingTimeOfScheduledBreaks = this.scheduledBreaksOfGroup().reduce(
      (total, adBreak) => total + this.track(adBreak).countedDurationFrom(),
      0,
    );

    // The played time is part of the active ad's duration, so it is only subtracted when that ad is counted
    const playedTimeOfActiveAd = activeAdIsCounted ? this.player.getCurrentTime() : 0;

    return remainingTimeOfActiveBreak + remainingTimeOfScheduledBreaks - playedTimeOfActiveAd;
  }

  /** Unsubscribes all player events and resets state. Call when the tracker is no longer needed. */
  release(): void {
    this.player.off(this.player.exports.PlayerEvent.AdStarted, this.handleAdStarted);
    this.player.off(this.player.exports.PlayerEvent.AdBreakFinished, this.handleAdBreakFinished);
    this.reset();
    this.events.onAdCountChanged.unsubscribeAll();
  }

  private track(adBreak: AdBreak, lastActiveAd?: Ad): TrackedAdBreak {
    return new TrackedAdBreak(adBreak, this.shouldCountAd, lastActiveAd);
  }

  /** Ad breaks of the current group that have not started yet */
  private scheduledBreaksOfGroup(): AdBreak[] {
    return (this.player.ads?.list?.() ?? []).filter(adBreak => adBreak.scheduleTime === this.groupScheduleTime);
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
    const trackedBreak = this.track(activeBreak, this.player.ads?.getActiveAd?.());

    if (isPartOfExistingGroup || hasSubsequentBreaks) {
      if (!isPartOfExistingGroup && this.groupBreaks.length > 0) {
        // New group at a different scheduleTime — clear stale state from a previous group
        this.groupBreaks = [];
      }

      this.groupScheduleTime = activeBreak.scheduleTime;

      const existingBreakIndex = this.groupBreaks.findIndex(b => b.isBreak(activeBreak));
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

import {Event, EventDispatcher, NoArgs} from './eventdispatcher';
import {BrowserUtils} from './browserutils';
import { UIInstanceManager } from './uimanager';
import { PlayerAPI, TimeRange } from 'bitmovin-player';

export namespace PlayerUtils {

  export enum PlayerState {
    Idle,
    Prepared,
    Playing,
    Paused,
    Finished,
  }

  export function isTimeShiftAvailable(player: PlayerAPI): boolean {
    return player.isLive() && player.getMaxTimeShift() !== 0;
  }

  export function getState(player: PlayerAPI): PlayerState {
    if (player.hasEnded()) {
      return PlayerState.Finished;
    } else if (player.isPlaying()) {
      return PlayerState.Playing;
    } else if (player.isPaused()) {
      return PlayerState.Paused;
    } else if (player.getSource() != null) {
      return PlayerState.Prepared;
    } else {
      return PlayerState.Idle;
    }
  }

  /**
   * Returns the currentTime - seekableRange.start. This ensures a user-friendly currentTime after a live stream
   * transitioned to VoD.
   * @param player
   */
  export function getCurrentTimeRelativeToSeekableRange(player: PlayerAPI): number {
    const currentTime = player.getCurrentTime();
    if (player.isLive()) {
      return currentTime;
    }

    const seekableRangeStart = PlayerUtils.getSeekableRangeStart(player, 0);
    return currentTime - seekableRangeStart;
  }

  /**
   * Returns the start value of the seekable range or the defaultValue if no seekableRange is present.
   * For now this happens only in combination with Mobile SDKs.
   *
   * TODO: remove this function in next major release
   *
   * @param player
   * @param defaultValue
   */
  export function getSeekableRangeStart(player: PlayerAPI, defaultValue: number = 0) {
    return player.getSeekableRange() && player.getSeekableRange().start || defaultValue;
  }

  /**
   * Calculates player seekable time range for live.
   * As the player returns `{ start: -1, end: -1 }` for live streams we need to calculate the `seekableRange` based on `maxTimeshift`.
   *
   * @param player
   */
  export function getSeekableRangeRespectingLive(player: PlayerAPI): TimeRange {
    if (!player.isLive()) {
      return player.getSeekableRange();
    }

    const currentTimeshift = -player.getTimeShift();
    const maxTimeshift = -player.getMaxTimeShift();
    const currentTime = player.getCurrentTime();

    const end = currentTime + (currentTimeshift);
    const start = currentTime - (maxTimeshift - currentTimeshift);

    return { start, end };
  }

  export interface TimeShiftAvailabilityChangedArgs extends NoArgs {
    timeShiftAvailable: boolean;
  }

  export class TimeShiftAvailabilityDetector {

    private player: PlayerAPI;
    private timeShiftAvailable: boolean;
    private timeShiftAvailabilityChangedEvent = new EventDispatcher<PlayerAPI, TimeShiftAvailabilityChangedArgs>();

    constructor(player: PlayerAPI) {
      this.player = player;
      this.timeShiftAvailable = undefined;

      let timeShiftDetector = () => {
        this.detect();
      };
      // Try to detect timeshift availability when source is loaded, which works for DASH streams
      player.on(player.exports.PlayerEvent.SourceLoaded, timeShiftDetector);
      // With HLS/NativePlayer streams, getMaxTimeShift can be 0 before the buffer fills, so we need to additionally
      // check timeshift availability in TimeChanged
      player.on(player.exports.PlayerEvent.TimeChanged, timeShiftDetector);
    }

    detect(): void {
      if (this.player.isLive()) {
        let timeShiftAvailableNow = PlayerUtils.isTimeShiftAvailable(this.player);

        // When the availability changes, we fire the event
        if (timeShiftAvailableNow !== this.timeShiftAvailable) {
          this.timeShiftAvailabilityChangedEvent.dispatch(this.player, { timeShiftAvailable: timeShiftAvailableNow });
          this.timeShiftAvailable = timeShiftAvailableNow;
        }
      }
    }

    get onTimeShiftAvailabilityChanged(): Event<PlayerAPI, TimeShiftAvailabilityChangedArgs> {
      return this.timeShiftAvailabilityChangedEvent.getEvent();
    }
  }

  export interface LiveStreamDetectorEventArgs extends NoArgs {
    live: boolean;
  }

  /**
   * Detects changes of the stream type, i.e. changes of the return value of the player#isLive method.
   * Normally, a stream cannot change its type during playback, it's either VOD or live. Due to bugs on some
   * platforms or browsers, it can still change. It is therefore unreliable to just check #isLive and this detector
   * should be used as a workaround instead.
   *
   * Additionally starting with player v8.19.0 we have the use-case that a live stream changes into a vod.
   * The DurationChanged event indicates this switch.
   *
   * Known cases:
   *
   * - HLS VOD on Android 4.3
   * Video duration is initially 'Infinity' and only gets available after playback starts, so streams are wrongly
   * reported as 'live' before playback (the live-check in the player checks for infinite duration).
   *
   * @deprecated since UI v3.9.0 in combination with player v8.19.0 use PlayerEvent.DurationChanged instead
   *
   * TODO: remove this class in next major release
   */
  export class LiveStreamDetector {

    private player: PlayerAPI;
    private live: boolean;
    private liveChangedEvent = new EventDispatcher<PlayerAPI, LiveStreamDetectorEventArgs>();
    private uimanager: UIInstanceManager;

    constructor(player: PlayerAPI, uimanager: UIInstanceManager) {
      this.player = player;
      this.uimanager = uimanager;
      this.live = undefined;

      let liveDetector = () => {
        this.detect();
      };
      this.uimanager.getConfig().events.onUpdated.subscribe(liveDetector);
      // Re-evaluate when playback starts
      player.on(player.exports.PlayerEvent.Play, liveDetector);

      // HLS live detection workaround for Android:
      // Also re-evaluate during playback, because that is when the live flag might change.
      // (Doing it only in Android Chrome saves unnecessary overhead on other platforms)
      if (BrowserUtils.isAndroid && BrowserUtils.isChrome) {
        player.on(player.exports.PlayerEvent.TimeChanged, liveDetector);
      }

      // DurationChanged event was introduced with player v8.19.0
      if (player.exports.PlayerEvent.DurationChanged) {
        player.on(player.exports.PlayerEvent.DurationChanged, liveDetector);
      }

      // Ad video's isLive() might be different than the actual video's isLive().
      player.on(player.exports.PlayerEvent.AdBreakStarted, liveDetector);
      player.on(player.exports.PlayerEvent.AdBreakFinished, liveDetector);
    }

    detect(): void {
      let liveNow = this.player.isLive();

      // Compare current to previous live state flag and fire event when it changes. Since we initialize the flag
      // with undefined, there is always at least an initial event fired that tells listeners the live state.
      if (liveNow !== this.live) {
        this.liveChangedEvent.dispatch(this.player, { live: liveNow });
        this.live = liveNow;
      }
    }

    get onLiveChanged(): Event<PlayerAPI, LiveStreamDetectorEventArgs> {
      return this.liveChangedEvent.getEvent();
    }
  }

  export function clampValueToRange(value: number, boundary1: number, boundary2: number): number {
    const lowerBoundary = Math.min(boundary1, boundary2);
    const upperBoundary = Math.max(boundary1, boundary2);
    return Math.min(Math.max(value, lowerBoundary), upperBoundary);
  }
}

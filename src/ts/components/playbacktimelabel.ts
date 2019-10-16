import {LabelConfig, Label} from './label';
import {UIInstanceManager} from '../uimanager';
import LiveStreamDetectorEventArgs = PlayerUtils.LiveStreamDetectorEventArgs;
import {PlayerUtils} from '../playerutils';
import {StringUtils} from '../stringutils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

export enum PlaybackTimeLabelMode {
  /**
   * Displays the current time
   */
  CurrentTime,
  /**
   * Displays the duration of the content
   */
  TotalTime,
  /**
   * Displays the current time and the duration of the content
   * Format: ${currentTime} / ${totalTime}
   */
  CurrentAndTotalTime,
  /**
   * Displays the remaining time of the content
   */
  RemainingTime,
}

export interface PlaybackTimeLabelConfig extends LabelConfig {
  /**
   * The type of which time should be displayed in the label.
   * Default: PlaybackTimeLabelMode.CurrentAndTotalTime
   */
  timeLabelMode?: PlaybackTimeLabelMode;
  /**
   * Boolean if the label should be hidden in live playback
   */
  hideInLivePlayback?: boolean;
}

/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
export class PlaybackTimeLabel extends Label<PlaybackTimeLabelConfig> {

  private timeFormat: string;

  constructor(config: PlaybackTimeLabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <PlaybackTimeLabelConfig>{
      cssClass: 'ui-playbacktimelabel',
      timeLabelMode: PlaybackTimeLabelMode.CurrentAndTotalTime,
      hideInLivePlayback: false,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let live = false;
    let liveCssClass = this.prefixCss('ui-playbacktimelabel-live');
    let liveEdgeCssClass = this.prefixCss('ui-playbacktimelabel-live-edge');
    let minWidth = 0;

    let liveClickHandler = () => {
      player.timeShift(0);
    };

    let updateLiveState = () => {
      // Player is playing a live stream when the duration is infinite
      live = player.isLive();

      // Attach/detach live marker class
      if (live) {
        this.getDomElement().addClass(liveCssClass);
        this.setText(i18n.getLocalizer('live'));
        if (config.hideInLivePlayback) {
          this.hide();
        }
        this.onClick.subscribe(liveClickHandler);
        updateLiveTimeshiftState();
      } else {
        this.getDomElement().removeClass(liveCssClass);
        this.getDomElement().removeClass(liveEdgeCssClass);
        this.show();
        this.onClick.unsubscribe(liveClickHandler);
      }
    };

    let updateLiveTimeshiftState = () => {
      if (!live) {
        return;
      }

      // The player is only at the live edge iff the stream is not shifted and it is actually playing or playback has
      // never been started (meaning it isn't paused). A player that is paused is always behind the live edge.
      // An exception is made for live streams without a timeshift window, because here we "stop" playback instead
      // of pausing it (from a UI perspective), so we keep the live edge indicator on because a play would always
      // resume at the live edge.
      const isTimeshifted = player.getTimeShift() < 0;
      const isTimeshiftAvailable = player.getMaxTimeShift() < 0;
      if (!isTimeshifted && (!player.isPaused() || !isTimeshiftAvailable)) {
        this.getDomElement().addClass(liveEdgeCssClass);
      } else {
        this.getDomElement().removeClass(liveEdgeCssClass);
      }
    };

    let liveStreamDetector = new PlayerUtils.LiveStreamDetector(player, uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: LiveStreamDetectorEventArgs) => {
      live = args.live;
      updateLiveState();
    });
    liveStreamDetector.detect(); // Initial detection

    let playbackTimeHandler = () => {
      if (!live && player.getDuration() !== Infinity) {
        this.setTime(player.getCurrentTime(), player.getDuration());
      }

      // To avoid 'jumping' in the UI by varying label sizes due to non-monospaced fonts,
      // we gradually increase the min-width with the content to reach a stable size.
      let width = this.getDomElement().width();
      if (width > minWidth) {
        minWidth = width;
        this.getDomElement().css({
          'min-width': minWidth + 'px',
        });
      }
    };

    player.on(player.exports.PlayerEvent.TimeChanged, playbackTimeHandler);
    player.on(player.exports.PlayerEvent.Seeked, playbackTimeHandler);

    player.on(player.exports.PlayerEvent.TimeShift, updateLiveTimeshiftState);
    player.on(player.exports.PlayerEvent.TimeShifted, updateLiveTimeshiftState);
    player.on(player.exports.PlayerEvent.Playing, updateLiveTimeshiftState);
    player.on(player.exports.PlayerEvent.Paused, updateLiveTimeshiftState);

    let init = () => {
      // Reset min-width when a new source is ready (especially for switching VOD/Live modes where the label content
      // changes)
      minWidth = 0;
      this.getDomElement().css({
        'min-width': null,
      });

      // Set time format depending on source duration
      this.timeFormat = Math.abs(player.isLive() ? player.getMaxTimeShift() : player.getDuration()) >= 3600 ?
        StringUtils.FORMAT_HHMMSS : StringUtils.FORMAT_MMSS;

      // Update time after the format has been set
      playbackTimeHandler();
    };
    uimanager.getConfig().events.onUpdated.subscribe(init);

    init();
  }

  /**
   * Sets the current playback time and total duration.
   * @param playbackSeconds the current playback time in seconds
   * @param durationSeconds the total duration in seconds
   */
  setTime(playbackSeconds: number, durationSeconds: number) {
    let currentTime = StringUtils.secondsToTime(playbackSeconds, this.timeFormat);
    let totalTime = StringUtils.secondsToTime(durationSeconds, this.timeFormat);

    switch ((<PlaybackTimeLabelConfig>this.config).timeLabelMode) {
      case PlaybackTimeLabelMode.CurrentTime:
        this.setText(`${currentTime}`);
        break;
      case PlaybackTimeLabelMode.TotalTime:
        this.setText(`${totalTime}`);
        break;
      case PlaybackTimeLabelMode.CurrentAndTotalTime:
        this.setText(`${currentTime} / ${totalTime}`);
        break;
      case PlaybackTimeLabelMode.RemainingTime:
        let remainingTime = StringUtils.secondsToTime(durationSeconds - playbackSeconds, this.timeFormat);
        this.setText(`${remainingTime}`);
        break;
    }
  }

  /**
   * Sets the current time format
   * @param timeFormat the time format
   */
  protected setTimeFormat(timeFormat: string): void {
    this.timeFormat = timeFormat;
  }
}

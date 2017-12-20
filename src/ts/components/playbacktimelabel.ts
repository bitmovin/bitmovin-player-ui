import {LabelConfig, Label} from './label';
import {UIInstanceManager} from '../uimanager';
import LiveStreamDetectorEventArgs = PlayerUtils.LiveStreamDetectorEventArgs;
import {PlayerUtils} from '../playerutils';
import {StringUtils} from '../stringutils';

export enum PlaybackTimeLabelMode {
  CurrentTime,
  TotalTime,
  CurrentAndTotalTime,
}

export interface PlaybackTimeLabelConfig extends LabelConfig {
  timeLabelMode?: PlaybackTimeLabelMode;
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

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <PlaybackTimeLabelConfig>this.getConfig();
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
        this.setText('Live');
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
      // The player is only at the live edge iff the stream is not shifted and it is actually playing or playback has
      // never been started (meaning it isn't paused). A player that is paused is always behind the live edge.
      if (player.getTimeShift() === 0 && !player.isPaused()) {
        this.getDomElement().addClass(liveEdgeCssClass);
      } else {
        this.getDomElement().removeClass(liveEdgeCssClass);
      }
    };

    let liveStreamDetector = new PlayerUtils.LiveStreamDetector(player);
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

    player.addEventHandler(player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_SEEKED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_CAST_TIME_UPDATED, playbackTimeHandler);

    player.addEventHandler(player.EVENT.ON_TIME_SHIFT, updateLiveTimeshiftState);
    player.addEventHandler(player.EVENT.ON_TIME_SHIFTED, updateLiveTimeshiftState);
    player.addEventHandler(player.EVENT.ON_PLAY, updateLiveTimeshiftState);
    player.addEventHandler(player.EVENT.ON_PAUSED, updateLiveTimeshiftState);

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
    player.addEventHandler(player.EVENT.ON_READY, init);

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

import {LabelConfig, Label} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../utils';

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

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;
    let config = <PlaybackTimeLabelConfig>self.getConfig();
    let live = false;
    let liveCssClass = self.prefixCss('ui-playbacktimelabel-live');
    let liveEdgeCssClass = self.prefixCss('ui-playbacktimelabel-live-edge');
    let minWidth = 0;

    let liveClickHandler = function() {
      player.timeShift(0);
    };

    let updateLiveState = function() {
      // Player is playing a live stream when the duration is infinite
      live = (player.getDuration() === Infinity);

      // Attach/detach live marker class
      if (live) {
        self.getDomElement().addClass(liveCssClass);
        self.setText('Live');
        if (config.hideInLivePlayback) {
          self.hide();
        }
        self.onClick.subscribe(liveClickHandler);
        updateLiveTimeshiftState();
      } else {
        self.getDomElement().removeClass(liveCssClass);
        self.getDomElement().removeClass(liveEdgeCssClass);
        self.show();
        self.onClick.unsubscribe(liveClickHandler);
      }
    };

    let updateLiveTimeshiftState = function() {
      if (player.getTimeShift() === 0) {
        self.getDomElement().addClass(liveEdgeCssClass);
      } else {
        self.getDomElement().removeClass(liveEdgeCssClass);
      }
    };

    let playbackTimeHandler = function() {
      if ((player.getDuration() === Infinity) !== live) {
        updateLiveState();
      }

      if (!live) {
        self.setTime(player.getCurrentTime(), player.getDuration());
      }

      // To avoid 'jumping' in the UI by varying label sizes due to non-monospaced fonts,
      // we gradually increase the min-width with the content to reach a stable size.
      let width = self.getDomElement().width();
      if (width > minWidth) {
        minWidth = width;
        self.getDomElement().css({
          'min-width': minWidth + 'px'
        });
      }
    };

    player.addEventHandler(player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_SEEKED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_CAST_TIME_UPDATED, playbackTimeHandler);

    player.addEventHandler(player.EVENT.ON_TIME_SHIFT, updateLiveTimeshiftState);
    player.addEventHandler(player.EVENT.ON_TIME_SHIFTED, updateLiveTimeshiftState);

    let init = function() {
      // Reset min-width when a new source is ready (especially for switching VOD/Live modes where the label content
      // changes)
      minWidth = 0;
      self.getDomElement().css({
        'min-width': null
      });

      // Set time format depending on source duration
      self.timeFormat = Math.abs(player.isLive() ? player.getMaxTimeShift() : player.getDuration()) >= 3600 ?
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
}
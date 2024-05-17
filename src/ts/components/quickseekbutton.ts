import { Button, ButtonConfig } from './button';
import { i18n } from '../localization/i18n';
import { PlayerAPI, SeekEvent, TimeShiftEvent } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { PlayerUtils } from '../playerutils';

export interface QuickSeekButtonConfig extends ButtonConfig {
  /**
   * Specify how many seconds the player should seek forward/backwards in the stream.
   * Negative values mean a backwards seek, positive values mean a forward seek.
   * Default is -10.
   */
  seekSeconds?: number;
}

export class QuickSeekButton extends Button<QuickSeekButtonConfig> {
  private currentSeekTarget: number | null;
  private player: PlayerAPI;

  constructor(config: QuickSeekButtonConfig = {}) {
    super(config);
    this.currentSeekTarget = null;

    this.config = this.mergeConfig(
      config,
      {
        seekSeconds: -10,
        cssClass: 'ui-quickseekbutton',
      },
      this.config,
    );

    const seekDirection = this.config.seekSeconds < 0 ? 'rewind' : 'forward';

    this.config.text = this.config.text || i18n.getLocalizer(`quickseek.${seekDirection}`);
    this.config.ariaLabel = this.config.ariaLabel || i18n.getLocalizer(`quickseek.${seekDirection}`);

    this.getDomElement().data(this.prefixCss('seek-direction'), seekDirection);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.player = player;

    let isLive: boolean;
    let hasTimeShift: boolean;

    const switchVisibility = (isLive: boolean, hasTimeShift: boolean) => {
      if (isLive && !hasTimeShift) {
        this.hide();
      } else {
        this.show();
      }
    };

    const timeShiftDetector = new PlayerUtils.TimeShiftAvailabilityDetector(player);
    timeShiftDetector.onTimeShiftAvailabilityChanged.subscribe(
      (sender, args: PlayerUtils.TimeShiftAvailabilityChangedArgs) => {
        hasTimeShift = args.timeShiftAvailable;
        switchVisibility(isLive, hasTimeShift);
      },
    );

    let liveStreamDetector = new PlayerUtils.LiveStreamDetector(player, uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: PlayerUtils.LiveStreamDetectorEventArgs) => {
      isLive = args.live;
      switchVisibility(isLive, hasTimeShift);
    });

    // Initial detection
    timeShiftDetector.detect();
    liveStreamDetector.detect();

    this.onClick.subscribe(() => {
      if (isLive && !hasTimeShift) {
        // If no DVR window is available, the button should be hidden anyway, so this is to be absolutely sure
        return;
      }

      if (isLive && this.config.seekSeconds > 0 && player.getTimeShift() === 0) {
        // Don't do anything if the player is already on the live edge
        return;
      }

      const currentPosition =
        this.currentSeekTarget !== null
          ? this.currentSeekTarget
          : isLive
            ? player.getTimeShift()
            : player.getCurrentTime();

      const newSeekTime = currentPosition + this.config.seekSeconds;

      if (isLive) {
        const clampedValue = PlayerUtils.clampValueToRange(newSeekTime, player.getMaxTimeShift(), 0);
        player.timeShift(clampedValue);
      } else {
        const clampedValue = PlayerUtils.clampValueToRange(newSeekTime, 0, player.getDuration());
        player.seek(clampedValue);
      }
    });

    this.player.on(this.player.exports.PlayerEvent.Seek, this.onSeek);
    this.player.on(this.player.exports.PlayerEvent.Seeked, this.onSeekedOrTimeShifted);
    this.player.on(this.player.exports.PlayerEvent.TimeShift, this.onTimeShift);
    this.player.on(this.player.exports.PlayerEvent.TimeShifted, this.onSeekedOrTimeShifted);
  }

  private onSeek = (event: SeekEvent): void => {
    this.currentSeekTarget = event.seekTarget;
  };

  private onSeekedOrTimeShifted = () => {
    this.currentSeekTarget = null;
  };

  private onTimeShift = (event: TimeShiftEvent): void => {
    this.currentSeekTarget = this.player.getTimeShift() + (event.target - event.position);
  }

  release(): void {
    this.player.off(this.player.exports.PlayerEvent.Seek, this.onSeek);
    this.player.off(this.player.exports.PlayerEvent.Seeked, this.onSeekedOrTimeShifted);
    this.player.off(this.player.exports.PlayerEvent.TimeShift, this.onTimeShift);
    this.player.off(this.player.exports.PlayerEvent.TimeShifted, this.onSeekedOrTimeShifted);
    this.currentSeekTarget = null;
    this.player = null;
  }
}

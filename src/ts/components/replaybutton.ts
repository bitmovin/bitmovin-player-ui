import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { PlayerUtils } from '../playerutils';
import LiveStreamDetectorEventArgs = PlayerUtils.LiveStreamDetectorEventArgs;

/**
 * A button to play/replay a video.
 *
 * @category Buttons
 */
export class ReplayButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-replaybutton',
      text: i18n.getLocalizer('replay'),
      ariaLabel: i18n.getLocalizer('replay'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (player.isLive()) {
      this.hide();
    }

    const liveStreamDetector = new PlayerUtils.LiveStreamDetector(player, uimanager);
    liveStreamDetector.onLiveChanged.subscribe((sender, args: LiveStreamDetectorEventArgs) => {
      if (args.live) {
        this.hide();
      } else {
        this.show();
      }
    });

    this.onClick.subscribe(() => {
      if (!player.hasEnded()) {
        player.seek(0);
        // Not calling `play` will keep the play/pause state as is
      } else {
        // If playback has already ended, calling `play` will automatically restart from the beginning
        player.play('ui');
      }
    });
  }
}

import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles audio muting.
 */
export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-volumetogglebutton',
      text: 'Volume/Mute',
      onClass: 'muted',
      offClass: 'unmuted',
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const volumeController = uimanager.getConfig().volumeController;

    volumeController.onChanged.subscribe((_, args) => {
      if (args.muted) {
        this.on();

        // When the volume is unmuted and the volume level is veeeery low, we increase it to 10%. This especially helps
        // in the case when the volume is first turned down to 0 and then the player is muted; when the player gets
        // unmuted it would switch to volume level 0 which would seem like unmuting did not work, and increasing the
        // level a bit helps to overcome this issue.
        if (args.volume < 10) {
          volumeController.setVolume(10);
        }
      } else {
        this.off();
      }

      const volumeLevelTens = Math.ceil(args.volume / 10);
      this.getDomElement().data(this.prefixCss('volume-level-tens'), String(volumeLevelTens));

      // When the volume is turned down to zero, switch into the mute state of the button. This avoids the usability
      // issue where the volume is turned down to zero, the button shows the muted icon but is not really unmuted, and
      // the next button press would switch it into the mute state, visually staying the same which would seem like
      // an expected unmute did not work.
      if (volumeLevelTens === 0) {
        this.off();
      }
    });

    this.onClick.subscribe(() => {
      volumeController.toggleMuted();
    });
  }
}
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

    let muteStateHandler = () => {
      if (player.isMuted()) {
        this.on();
      } else {
        this.off();
      }
    };

    let volumeLevelHandler = () => {
      const volumeLevelTens = Math.ceil(player.getVolume() / 10);
      this.getDomElement().data(this.prefixCss('volume-level-tens'), String(volumeLevelTens));
    };

    player.addEventHandler(player.EVENT.ON_MUTED, muteStateHandler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, muteStateHandler);
    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, volumeLevelHandler);

    this.onClick.subscribe(() => {
      if (player.isMuted()) {
        player.unmute('ui-volumetogglebutton');
      } else {
        player.mute('ui-volumetogglebutton');
      }
    });

    // Startup init
    muteStateHandler();
    volumeLevelHandler();
  }
}
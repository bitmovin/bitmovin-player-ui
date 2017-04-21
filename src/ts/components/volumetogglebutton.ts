import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles audio muting.
 */
export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-volumetogglebutton',
      text: 'Volume/Mute'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let muteStateHandler = () => {
      if (player.isMuted()) {
        this.on();
      } else {
        this.off();
      }
    };

    let volumeLevelHandler = () => {
      // Toggle low class to display low volume icon below 50% volume
      if (player.getVolume() < 50) {
        this.getDomElement().addClass(this.prefixCss('low'));
      } else {
        this.getDomElement().removeClass(this.prefixCss('low'));
      }
    };

    player.addEventHandler(player.EVENT.ON_MUTED, muteStateHandler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, muteStateHandler);
    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, volumeLevelHandler);

    this.onClick.subscribe(() => {
      if (player.isMuted()) {
        player.unmute();
      } else {
        player.mute();
      }
    });

    // Startup init
    muteStateHandler();
    volumeLevelHandler();
  }
}
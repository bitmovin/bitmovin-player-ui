import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import VolumeChangeEvent = bitmovin.player.VolumeChangeEvent;

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

    player.addEventHandler(player.EVENT.ON_MUTED, muteStateHandler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, muteStateHandler);

    this.onClick.subscribe(() => {
      if (player.isMuted()) {
        player.unmute();
      } else {
        player.mute();
      }
    });

    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, (event: VolumeChangeEvent) => {
      // Toggle low class to display low volume icon below 50% volume
      if (event.targetVolume < 50) {
        this.getDomElement().addClass(this.prefixCss('low'));
      } else {
        this.getDomElement().removeClass(this.prefixCss('low'));
      }
    });

    // Startup init
    muteStateHandler();
  }
}
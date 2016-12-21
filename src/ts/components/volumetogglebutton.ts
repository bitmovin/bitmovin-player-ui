import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIManager} from '../uimanager';
import VolumeChangeEvent = bitmovin.player.VolumeChangeEvent;

/**
 * A button that toggles audio muting.
 */
export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-volumetogglebutton',
      text    : 'Volume/Mute'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    let muteStateHandler = function() {
      if (player.isMuted()) {
        self.on();
      } else {
        self.off();
      }
    };

    player.addEventHandler(bitmovin.player.EVENT.ON_MUTED, muteStateHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTED, muteStateHandler);

    self.onClick.subscribe(function() {
      if (player.isMuted()) {
        player.unmute();
      } else {
        player.mute();
      }
    });

    player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGED, function(event: VolumeChangeEvent) {
      // Toggle low class to display low volume icon below 50% volume
      if (event.targetVolume < 50) {
        self.getDomElement().addClass(self.prefixCss('low'));
      } else {
        self.getDomElement().removeClass(self.prefixCss('low'));
      }
    });

    // Startup init
    muteStateHandler();
  }
}
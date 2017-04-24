import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles casting to a Cast receiver.
 */
export class CastToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-casttogglebutton',
      text: 'Google Cast'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      if (player.isCastAvailable()) {
        if (player.isCasting()) {
          player.castStop();
        } else {
          player.castVideo();
        }
      } else {
        if (console) {
          console.log('Cast unavailable');
        }
      }
    });

    let castAvailableHander = () => {
      if (player.isCastAvailable()) {
        this.show();
      } else {
        this.hide();
      }
    };

    player.addEventHandler(player.EVENT.ON_CAST_AVAILABLE, castAvailableHander);

    // Toggle button 'on' state
    player.addEventHandler(player.EVENT.ON_CAST_WAITING_FOR_DEVICE, () => {
      this.on();
    });
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, () => {
      // When a session is resumed, there is no ON_CAST_START event, so we also need to toggle here for such cases
      this.on();
    });
    player.addEventHandler(player.EVENT.ON_CAST_STOPPED, () => {
      this.off();
    });

    // Startup init
    castAvailableHander(); // Hide button if Cast not available
    if (player.isCasting()) {
      this.on();
    }
  }
}
import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles Apple AirPlay.
 */
export class AirPlayToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-airplaytogglebutton',
      text: 'Apple AirPlay'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;

    self.onClick.subscribe(function() {
      if (player.isAirplayAvailable()) {
        player.showAirplayTargetPicker();
      } else {
        if (console) {
          console.log('AirPlay unavailable');
        }
      }
    });

    let airPlayAvailableHandler = function() {
      if (player.isAirplayAvailable()) {
        self.show();
      } else {
        self.hide();
      }
    };

    // Startup init
    airPlayAvailableHandler(); // Hide button if AirPlay is not available
  }
}
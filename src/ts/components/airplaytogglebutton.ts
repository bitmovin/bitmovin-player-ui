import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles Apple AirPlay.
 */
export class AirPlayToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-airplaytogglebutton',
      text: i18n.getLocalizer('appleAirplay'),
      role: 'img',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (!player.isAirplayAvailable) {
      // If the player does not support Airplay (player 7.0), we just hide this component and skip configuration
      this.hide();
      return;
    }

    this.onClick.subscribe(() => {
      if (player.isAirplayAvailable()) {
        player.showAirplayTargetPicker();
      } else {
        if (console) {
          console.log('AirPlay unavailable');
        }
      }
    });

    const airPlayAvailableHandler = () => {
      if (player.isAirplayAvailable()) {
        this.show();
      } else {
        this.hide();
      }
    };

    const airPlayChangedHandler = () => {
      if (player.isAirplayActive()) {
        this.on();
      } else {
        this.off();
      }
    };

    player.on(player.exports.PlayerEvent.AirplayAvailable, airPlayAvailableHandler);
    player.on(player.exports.PlayerEvent.AirplayChanged, airPlayChangedHandler);

    // Startup init
    airPlayAvailableHandler(); // Hide button if AirPlay is not available
    airPlayChangedHandler();
  }
}
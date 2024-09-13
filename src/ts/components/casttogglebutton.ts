import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles casting to a Cast receiver.
 *
 * @category Buttons
 */
export class CastToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-casttogglebutton',
      text: i18n.getLocalizer('googleCast'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
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

    player.on(player.exports.PlayerEvent.CastAvailable, castAvailableHander);

    // Toggle button 'on' state
    player.on(player.exports.PlayerEvent.CastWaitingForDevice, () => {
      this.on();
    });
    player.on(player.exports.PlayerEvent.CastStarted, () => {
      // When a session is resumed, there is no CastStart event, so we also need to toggle here for such cases
      this.on();
    });
    player.on(player.exports.PlayerEvent.CastStopped, () => {
      this.off();
    });

    // Startup init
    castAvailableHander(); // Hide button if Cast not available
    if (player.isCasting()) {
      this.on();
    }
  }
}
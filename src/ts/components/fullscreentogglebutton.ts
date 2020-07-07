import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles the player between windowed and fullscreen view.
 */
export class FullscreenToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-fullscreentogglebutton',
      text: i18n.getLocalizer('fullscreen'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let fullscreenStateHandler = () => {
      if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
        this.on();
      } else {
        this.off();
      }
    };

    let fullscreenAvailableHandler = () => {
      if (player.isViewModeAvailable(player.exports.ViewMode.Fullscreen)) {
        this.show();
      } else {
        this.hide();
      }
    };

    uimanager.getConfig().events.onUpdated.subscribe(fullscreenAvailableHandler);

    player.on(player.exports.PlayerEvent.ViewModeChanged, fullscreenStateHandler);

    this.onClick.subscribe(() => {
      if (player.isViewModeAvailable(player.exports.ViewMode.Fullscreen)) {
        if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
          player.setViewMode(player.exports.ViewMode.Inline);
        } else {
          player.setViewMode(player.exports.ViewMode.Fullscreen);
        }
      } else {
        if (console) {
          console.log('PIP unavailable');
        }
      }
    });

    // Startup init
    fullscreenAvailableHandler();
    fullscreenStateHandler();
  }
}

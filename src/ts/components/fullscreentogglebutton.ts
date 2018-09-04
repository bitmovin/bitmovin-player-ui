import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A button that toggles the player between windowed and fullscreen view.
 */
export class FullscreenToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-fullscreentogglebutton',
      text: 'Fullscreen',
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

    player.on(player.exports.Event.ViewModeChanged, fullscreenStateHandler);

    this.onClick.subscribe(() => {
      if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
        player.setViewMode(player.exports.ViewMode.Inline);
      } else {
        player.setViewMode(player.exports.ViewMode.Fullscreen);
      }
    });

    // Startup init
    fullscreenStateHandler();
  }
}
import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

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

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let fullscreenStateHandler = () => {
      if (player.isFullscreen()) {
        this.on();
      } else {
        this.off();
      }
    };

    player.on(player.EVENT.ON_FULLSCREEN_ENTER, fullscreenStateHandler);
    player.on(player.EVENT.ON_FULLSCREEN_EXIT, fullscreenStateHandler);

    this.onClick.subscribe(() => {
      if (player.isFullscreen()) {
        player.exitFullscreen();
      } else {
        player.enterFullscreen();
      }
    });

    // Startup init
    fullscreenStateHandler();
  }
}
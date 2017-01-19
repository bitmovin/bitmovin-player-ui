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
      text: 'Fullscreen'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;

    let fullscreenStateHandler = function() {
      if (player.isFullscreen()) {
        self.on();
      } else {
        self.off();
      }
    };

    player.addEventHandler(player.EVENT.ON_FULLSCREEN_ENTER, fullscreenStateHandler);
    player.addEventHandler(player.EVENT.ON_FULLSCREEN_EXIT, fullscreenStateHandler);

    self.onClick.subscribe(function() {
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
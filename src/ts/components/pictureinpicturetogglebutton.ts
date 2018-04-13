import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';

/**
 * A button that toggles Apple macOS picture-in-picture mode.
 */
export class PictureInPictureToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-piptogglebutton',
      text: 'Picture-in-Picture',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (!player.isPictureInPictureAvailable) {
      // If the player does not support PIP (player 7.0), we just hide this component and skip configuration
      this.hide();
      return;
    }

    this.onClick.subscribe(() => {
      if (player.isPictureInPictureAvailable()) {
        if (player.isPictureInPicture()) {
          player.exitPictureInPicture();
        } else {
          player.enterPictureInPicture();
        }
      } else {
        if (console) {
          console.log('PIP unavailable');
        }
      }
    });

    let pipAvailableHander = () => {
      if (player.isPictureInPictureAvailable()) {
        this.show();
      } else {
        this.hide();
      }
    };

    player.on(player.EVENT.ON_READY, pipAvailableHander);

    // Toggle button 'on' state
    player.on(player.EVENT.ON_PICTURE_IN_PICTURE_ENTER, () => {
      this.on();
    });
    player.on(player.EVENT.ON_PICTURE_IN_PICTURE_EXIT, () => {
      this.off();
    });

    // Startup init
    pipAvailableHander(); // Hide button if PIP not available
    if (player.isPictureInPicture()) {
      this.on();
    }
  }
}
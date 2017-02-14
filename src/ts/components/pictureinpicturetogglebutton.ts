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
      text: 'Picture-in-Picture'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

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

    player.addEventHandler(player.EVENT.ON_READY, pipAvailableHander);

    // Toggle button 'on' state
    player.addEventHandler(player.EVENT.ON_PICTURE_IN_PICTURE_ENTER, () => {
      this.on();
    });
    player.addEventHandler(player.EVENT.ON_PICTURE_IN_PICTURE_EXIT, () => {
      this.off();
    });

    // Startup init
    pipAvailableHander(); // Hide button if PIP not available
    if (player.isPictureInPicture()) {
      this.on();
    }
  }
}
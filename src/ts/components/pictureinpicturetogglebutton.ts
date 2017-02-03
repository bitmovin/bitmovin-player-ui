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

    let self = this;

    self.onClick.subscribe(function() {
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

    let pipAvailableHander = function() {
      if (player.isPictureInPictureAvailable()) {
        self.show();
      } else {
        self.hide();
      }
    };

    player.addEventHandler(player.EVENT.ON_READY, pipAvailableHander);

    // Toggle button 'on' state
    player.addEventHandler(player.EVENT.ON_PICTURE_IN_PICTURE_ENTER, function() {
      self.on();
    });
    player.addEventHandler(player.EVENT.ON_PICTURE_IN_PICTURE_EXIT, function() {
      self.off();
    });

    // Startup init
    pipAvailableHander(); // Hide button if PIP not available
    if (player.isPictureInPicture()) {
      self.on();
    }
  }
}
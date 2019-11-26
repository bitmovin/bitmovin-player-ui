import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles Apple macOS picture-in-picture mode.
 */
export class PictureInPictureToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-piptogglebutton',
      text: i18n.getLocalizer('pictureInPicture'),
      ariaLabel: i18n.getLocalizer('pictureInPicture')
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      if (player.isViewModeAvailable(player.exports.ViewMode.PictureInPicture)) {
        if (player.getViewMode() === player.exports.ViewMode.PictureInPicture) {
          player.setViewMode(player.exports.ViewMode.Inline);
        } else {
          player.setViewMode(player.exports.ViewMode.PictureInPicture);
        }
      } else {
        if (console) {
          console.log('PIP unavailable');
        }
      }
    });

    let pipAvailableHander = () => {
      if (player.isViewModeAvailable(player.exports.ViewMode.PictureInPicture)) {
        this.show();
      } else {
        this.hide();
      }
    };

    uimanager.getConfig().events.onUpdated.subscribe(pipAvailableHander);

    // Toggle button 'on' state
    player.on(player.exports.PlayerEvent.ViewModeChanged, () => {
      if (player.getViewMode() === player.exports.ViewMode.PictureInPicture) {
        this.on();
      } else {
        this.off();
      }
    });

    // Startup init
    pipAvailableHander(); // Hide button if PIP not available
    if (player.getViewMode() === player.exports.ViewMode.PictureInPicture) {
      this.on();
    }
  }
}
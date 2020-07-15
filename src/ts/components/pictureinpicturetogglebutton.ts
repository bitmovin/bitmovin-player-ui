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
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const isPictureInPictureAvailable = () => {
      return player.isViewModeAvailable(player.exports.ViewMode.PictureInPicture);
    };

    const pictureInPictureStateHandler = () => {
      player.getViewMode() === player.exports.ViewMode.PictureInPicture ? this.on() : this.off();
    };

    const pictureInPictureAvailabilityChangedHandler = () => {
      isPictureInPictureAvailable() ? this.show() : this.hide();
    };

    player.on(player.exports.PlayerEvent.ViewModeChanged, pictureInPictureStateHandler);

    // Available only in our native SDKs for now
    if ((player.exports.PlayerEvent as any).ViewModeAvailabilityChanged) {
      player.on(
        (player.exports.PlayerEvent as any).ViewModeAvailabilityChanged,
        pictureInPictureAvailabilityChangedHandler,
      );
    }

    uimanager.getConfig().events.onUpdated.subscribe(pictureInPictureAvailabilityChangedHandler);

    this.onClick.subscribe(() => {
      if (!isPictureInPictureAvailable()) {
        if (console) {
          console.log('PIP unavailable');
        }
        return;
      }

      const targetViewMode =
        player.getViewMode() === player.exports.ViewMode.PictureInPicture
          ? player.exports.ViewMode.Inline
          : player.exports.ViewMode.PictureInPicture;

      player.setViewMode(targetViewMode);
    });

    // Startup init
    pictureInPictureAvailabilityChangedHandler(); // Hide button if PIP not available
    pictureInPictureStateHandler();
  }
}

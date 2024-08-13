import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that toggles the player between windowed and fullscreen view.
 *
 * @category Buttons
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

    const isFullScreenAvailable = () => {
      return player.isViewModeAvailable(player.exports.ViewMode.Fullscreen);
    };

    const fullscreenStateHandler = () => {
      player.getViewMode() === player.exports.ViewMode.Fullscreen ? this.on() : this.off();
    };

    const fullscreenAvailabilityChangedHandler = () => {
      isFullScreenAvailable() ? this.show() : this.hide();
    };

    player.on(player.exports.PlayerEvent.ViewModeChanged, fullscreenStateHandler);

    // Available only in our native SDKs for now
    if ((player.exports.PlayerEvent as any).ViewModeAvailabilityChanged) {
      player.on(
        (player.exports.PlayerEvent as any).ViewModeAvailabilityChanged,
        fullscreenAvailabilityChangedHandler,
      );
    }

    uimanager.getConfig().events.onUpdated.subscribe(fullscreenAvailabilityChangedHandler);

    this.onClick.subscribe(() => {
      if (!isFullScreenAvailable()) {
        if (console) {
          console.log('Fullscreen unavailable');
        }
        return;
      }

      const targetViewMode =
        player.getViewMode() === player.exports.ViewMode.Fullscreen
          ? player.exports.ViewMode.Inline
          : player.exports.ViewMode.Fullscreen;

      player.setViewMode(targetViewMode);
    });

    // Startup init
    fullscreenAvailabilityChangedHandler();
    fullscreenStateHandler();
  }
}

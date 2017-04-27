import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import ErrorEvent = bitmovin.player.ErrorEvent;
import {TvNoiseCanvas} from './tvnoisecanvas';
import PlayerEvent = bitmovin.player.PlayerEvent;

/**
 * Configuration interface for the {@link ErrorMessageOverlay}.
 */
export interface ErrorMessageOverlayConfig extends ContainerConfig {
  /**
   * List of error messages from the player to overwrite or localize for the error message overlay. Every custom
   * error message must be mapped to the corresponding error code for which it will be displayed.
   *
   * Example:
   * <code>
   * errorMessageOverlayConfig = {
   *   messages: {
   *     // Overwrite error 3000 'Unknown error'
   *     3000: 'Houston, we have a problem'
   *   }
   * };
   * </code>
   */
  messages?: {
    [code: number]: string;
  }
}

/**
 * Overlays the player and displays error messages.
 */
export class ErrorMessageOverlay extends Container<ErrorMessageOverlayConfig> {

  private errorLabel: Label<LabelConfig>;
  private tvNoiseBackground: TvNoiseCanvas;

  constructor(config: ErrorMessageOverlayConfig = {}) {
    super(config);

    this.errorLabel = new Label<LabelConfig>({ cssClass: 'ui-errormessage-label' });
    this.tvNoiseBackground = new TvNoiseCanvas();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-errormessage-overlay',
      components: [this.tvNoiseBackground, this.errorLabel],
      hidden: true
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <ErrorMessageOverlayConfig>this.getConfig();

    player.addEventHandler(player.EVENT.ON_ERROR, (event: ErrorEvent) => {
      let message = event.message;

      // If the config contains a message override for the current code, user the configured message
      if (config.messages && config.messages[event.code]) {
        message = config.messages[event.code];
      }

      this.errorLabel.setText(message);
      this.tvNoiseBackground.start();
      this.show();
    });

    player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, (event: PlayerEvent) => {
      if (this.isShown()) {
        this.tvNoiseBackground.stop();
        this.hide();
      }
    });
  }
}
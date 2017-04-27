import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import ErrorEvent = bitmovin.player.ErrorEvent;
import {TvNoiseCanvas} from './tvnoisecanvas';
import PlayerEvent = bitmovin.player.PlayerEvent;

export interface ErrorMessageTranslator {
  (error: ErrorEvent): string;
}

/**
 * Configuration interface for the {@link ErrorMessageOverlay}.
 */
export interface ErrorMessageOverlayConfig extends ContainerConfig {
  /**
   * List of error messages from the player to overwrite or localize for the error message overlay. Every custom
   * error message must be mapped to the corresponding error code for which it will be displayed.
   * The localized error message can be a plain string or a function that receives the {@link ErrorEvent} as parameter
   * and returns a customized string. The function can be used to extract data from the original error message, e.g.
   * when it is parameterized.
   *
   * Example:
   * <code>
   * errorMessageOverlayConfig = {
   *   messages: {
   *     // Overwrite error 3000 'Unknown error'
   *     3000: 'Houston, we have a problem',
   *
   *     // Transform error 3001 'Unsupported manifest format' to uppercase
   *     3001: function(error) {
   *       return error.message.toUpperCase();
   *     },
   *
   *     // Customize error 3006 'Could not load manifest, got HTTP status code XXX'
   *     3006: function(error) {
   *       var statusCode = error.message.substring(46);
   *       return 'Manifest loading failed with HTTP error ' + statusCode;
   *     }
   *   }
   * };
   * </code>
   */
  messages?: {
    [code: number]: string | ErrorMessageTranslator;
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
        let customMessage = config.messages[event.code];

        if (typeof customMessage === 'string') {
          message = customMessage;
        } else {
          // The message is a translation function, so we call it
          message = customMessage(event);
        }
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
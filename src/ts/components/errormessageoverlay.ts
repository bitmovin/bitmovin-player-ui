import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {TvNoiseCanvas} from './tvnoisecanvas';
import {ErrorUtils} from '../errorutils';
import { ErrorEvent, PlayerAPI, PlayerEventBase } from 'bitmovin-player';

export interface ErrorMessageTranslator {
  (error: ErrorEvent): string;
}

export interface ErrorMessageMap {
  [code: number]: string | ErrorMessageTranslator;
}

/**
 * Configuration interface for the {@link ErrorMessageOverlay}.
 */
export interface ErrorMessageOverlayConfig extends ContainerConfig {
  /**
   * Allows overwriting of the error messages displayed in the overlay for customization and localization.
   * This is either a function that receives any {@link ErrorEvent} as parameter and translates error messages,
   * or a map of error codes that overwrites specific error messages with a plain string or a function that
   * receives the {@link ErrorEvent} as parameter and returns a customized string.
   * The translation functions can be used to extract data (e.g. parameters) from the original error message.
   *
   * Example 1 (catch-all translation function):
   * <code>
   * errorMessageOverlayConfig = {
   *   messages: function(error) {
   *     switch (error.code) {
   *       // Overwrite error 1000 'Unknown error'
   *       case 1000:
   *         return 'Houston, we have a problem'
   *
   *       // Transform error 1201 'The downloaded manifest is invalid' to uppercase
   *       case 1201:
   *         var description = ErrorUtils.defaultErrorMessages[error.code];
   *         return description.toUpperCase();
   *
   *       // Customize error 1207 'The manifest could not be loaded'
   *       case 1207:
   *         var statusCode = error.data.statusCode;
   *         return 'Manifest loading failed with HTTP error ' + statusCode;
   *     }
   *     // Return unmodified error message for all other errors
   *     return error.message;
   *   }
   * };
   * </code>
   *
   * Example 2 (translating specific errors):
   * <code>
   * errorMessageOverlayConfig = {
   *   messages: {
   *     // Overwrite error 1000 'Unknown error'
   *     1000: 'Houston, we have a problem',
   *
   *     // Transform error 1201 'Unsupported manifest format' to uppercase
   *     1201: function(error) {
   *       var description = ErrorUtils.defaultErrorMessages[error.code];
   *       return description.toUpperCase();
   *     },
   *
   *     // Customize error 1207 'The manifest could not be loaded'
   *     1207: function(error) {
   *       var statusCode = error.data.statusCode;
   *       return 'Manifest loading failed with HTTP error ' + statusCode;
   *     }
   *   }
   * };
   * </code>
   */
  messages?: ErrorMessageMap | ErrorMessageTranslator;
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
      hidden: true,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <ErrorMessageOverlayConfig>this.getConfig();

    player.on(player.exports.Event.Error, (event: ErrorEvent) => {
      let message = ErrorUtils.defaultErrorMessageTranslator(event);

      // errorMessages configured in `UIConfig` take precedence `ErrorMessageOverlayConfig`
      let errorMessages = uimanager.getConfig().errorMessages || config.messages;
      // Process message translations
      if (errorMessages) {
        if (typeof errorMessages === 'function') {
          // Translation function for all errors
          message = errorMessages(event);
        } else if (errorMessages[event.code]) {
          // It's not a translation function, so it must be a map of strings or translation functions
          let customMessage = errorMessages[event.code];

          if (typeof customMessage === 'string') {
            message = customMessage;
          } else {
            // The message is a translation function, so we call it
            message = customMessage(event);
          }
        }
      }

      this.errorLabel.setText(message);
      this.tvNoiseBackground.start();
      this.show();
    });

    player.on(player.exports.Event.SourceLoaded, (event: PlayerEventBase) => {
      if (this.isShown()) {
        this.tvNoiseBackground.stop();
        this.hide();
      }
    });
  }

  release(): void {
    super.release();

    // Canvas rendering must be explicitly stopped, else it just continues forever and hogs resources
    this.tvNoiseBackground.stop();
  }
}
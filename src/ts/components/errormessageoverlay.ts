import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import ErrorEvent = bitmovin.PlayerAPI.ErrorEvent;
import {TvNoiseCanvas} from './tvnoisecanvas';
import PlayerEvent = bitmovin.PlayerAPI.PlayerEvent;

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
   *       // Overwrite error 3000 'Unknown error'
   *       case 3000:
   *         return 'Houston, we have a problem'
   *
   *       // Transform error 3001 'Unsupported manifest format' to uppercase
   *       case 3001:
   *         return error.message.toUpperCase();
   *
   *       // Customize error 3006 'Could not load manifest, got HTTP status code XXX'
   *       case 3006:
   *         var statusCode = error.message.substring(46);
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

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <ErrorMessageOverlayConfig>this.getConfig();

    player.addEventHandler(player.Event.Error, (event: ErrorEvent) => {
      let message = event.message;

      // Process message translations
      if (config.messages) {
        if (typeof config.messages === 'function') {
          // Translation function for all errors
          message = config.messages(event);
        } else if (config.messages[event.code]) {
          // It's not a translation function, so it must be a map of strings or translation functions
          let customMessage = config.messages[event.code];

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

    player.addEventHandler(player.Event.SourceLoaded, (event: PlayerEvent) => {
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
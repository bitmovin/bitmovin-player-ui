import { ContainerConfig, Container } from '../Container';
import { Label, LabelConfig } from '../labels/Label';
import { UIInstanceManager } from '../../UIManager';
import { TvNoiseCanvas } from '../TvNoiseCanvas';
import { ErrorUtils } from '../../utils/ErrorUtils';
import { BrowserUtils } from '../../utils/BrowserUtils';
import { ErrorEvent, PlayerAPI, PlayerEventBase } from 'bitmovin-player';
import {
  isMobileV3PlayerAPI,
  MobileV3PlayerAPI,
  MobileV3PlayerErrorEvent,
  MobileV3PlayerEvent,
  MobileV3SourceErrorEvent,
} from '../../utils/MobileV3PlayerAPI';

export interface ErrorMessageTranslator {
  (error: ErrorEvent | MobileV3PlayerErrorEvent): string;
}

export interface ErrorMessageMap {
  [code: number]: string | ErrorMessageTranslator;
}

/**
 * Configuration interface for the {@link ErrorMessageOverlay}.
 *
 * @category Configs
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
 *
 * A displayed error is also announced to screen readers through the assertive alert region of
 * {@link UIInstanceManager.announce}. That region is already rendered and empty before the error, which is what
 * makes screen readers announce it reliably. The overlay itself has no live region role, so the error is
 * announced once.
 *
 * On Tizen, the overlay keeps the `status` role instead and the alert region is not used, because Tizen's
 * text-to-speech does not support `alert` (2.4) or only partly (3.0), but reads the overlay as a status.
 *
 * @category Components
 */
export class ErrorMessageOverlay extends Container<ErrorMessageOverlayConfig> {
  private errorLabel: Label<LabelConfig>;
  private tvNoiseBackground: TvNoiseCanvas;
  private uimanager?: UIInstanceManager;

  constructor(config: ErrorMessageOverlayConfig = {}) {
    super(config);

    this.errorLabel = new Label<LabelConfig>({ cssClass: 'ui-errormessage-label' });
    this.tvNoiseBackground = new TvNoiseCanvas();

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-errormessage-overlay',
        components: [this.tvNoiseBackground, this.errorLabel],
        hidden: true,
        // Tizen reads the error through this role, see the class description
        role: BrowserUtils.isTizen ? 'status' : undefined,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI | MobileV3PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    this.uimanager = uimanager;

    const config = this.getConfig();

    const handleErrorMessage = (
      event: ErrorEvent | MobileV3SourceErrorEvent | MobileV3PlayerErrorEvent,
      message: string,
    ) => {
      const customizedMessage = customizeErrorMessage(uimanager.getConfig().errorMessages || config.messages, event);
      if (customizedMessage) {
        message = customizedMessage;
      }

      this.display(message);
    };

    if (isMobileV3PlayerAPI(player)) {
      const errorEventHandler = (event: MobileV3SourceErrorEvent | MobileV3PlayerErrorEvent) => {
        const message = ErrorUtils.defaultMobileV3ErrorMessageTranslator(event);
        handleErrorMessage(event, message);
      };

      player.on(MobileV3PlayerEvent.PlayerError, errorEventHandler);
      player.on(MobileV3PlayerEvent.SourceError, errorEventHandler);
    } else {
      player.on(player.exports.PlayerEvent.Error, (event: ErrorEvent) => {
        const message = ErrorUtils.defaultWebErrorMessageTranslator(event);
        handleErrorMessage(event, message);
      });
    }

    player.on(player.exports.PlayerEvent.SourceLoaded, (event: PlayerEventBase) => {
      if (this.isShown()) {
        this.clear();
      }
    });
  }

  display(errorMessage: string): void {
    this.errorLabel.setText(errorMessage);
    this.tvNoiseBackground.start();
    this.show();
    // An error stops playback and needs the user's attention, so it interrupts the screen reader (WCAG 4.1.3).
    // Tizen reads the overlay itself through its status role, and would otherwise read the error twice.
    if (!BrowserUtils.isTizen) {
      this.uimanager?.announce(this.getRenderedErrorText() || errorMessage, { assertive: true });
    }
  }

  /**
   * Returns the text the label renders, one line per paragraph, list item or line break. Custom messages can
   * contain markup, e.g. a list, which must neither be read out as tags nor run its items together.
   */
  private getRenderedErrorText(): string | undefined {
    if (!this.errorLabel.hasDomElement()) {
      return undefined;
    }
    const labelElement = this.errorLabel.getDomElement().get(0) as HTMLElement | undefined;
    if (!labelElement) {
      return undefined;
    }

    return textWithLineBreaks(labelElement)
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(line => line !== '')
      .join('\n');
  }

  private clear(): void {
    this.errorLabel.setText('');

    // Canvas rendering must be explicitly stopped, else it just continues forever and hogs resources
    this.tvNoiseBackground.stop();
    this.hide();
  }

  release(): void {
    super.release();

    this.clear();
    this.uimanager = undefined;
  }
}

const BLOCK_ELEMENT_TAGS = [
  'ADDRESS',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TR',
  'UL',
];

/**
 * Like `textContent`, but with a line break around block elements and for `<br>`. `innerText` would do the same,
 * but only for rendered elements, and it forces a layout.
 */
function textWithLineBreaks(node: Node): string {
  let text = '';
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = (child as Element).tagName.toUpperCase();
      if (tagName === 'BR') {
        text += '\n';
      } else if (BLOCK_ELEMENT_TAGS.indexOf(tagName) !== -1) {
        text += '\n' + textWithLineBreaks(child) + '\n';
      } else {
        text += textWithLineBreaks(child);
      }
    }
  }
  return text;
}

function customizeErrorMessage(
  errorMessages: ErrorMessageTranslator | ErrorMessageMap,
  event: ErrorEvent | MobileV3PlayerErrorEvent | MobileV3SourceErrorEvent,
): string | undefined {
  if (!errorMessages) {
    return undefined;
  }

  // Process message vocabularies
  if (typeof errorMessages === 'function') {
    // Translation function for all errors
    return errorMessages(event);
  }
  if (errorMessages[event.code]) {
    // It's not a translation function, so it must be a map of strings or translation functions
    const customMessage = errorMessages[event.code];

    return typeof customMessage === 'string' ? customMessage : customMessage(event);
  }
}

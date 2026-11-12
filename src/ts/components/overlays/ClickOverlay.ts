import { Button, ButtonConfig } from '../buttons/Button';
import { ClickThroughUtils } from '../../utils/ClickThroughUtils';

/**
 * Configuration interface for a {@link ClickOverlay}.
 *
 * @category Configs
 */
export interface ClickOverlayConfig extends ButtonConfig {
  /**
   * The url to open when the overlay is clicked. Set to null to disable the click handler.
   * Only http and https URLs are opened, in a new tab without access to the player page.
   */
  url?: string;
}

/**
 * A click overlay that opens an url in a new tab if clicked.
 *
 * @category Components
 */
export class ClickOverlay extends Button<ClickOverlayConfig> {
  constructor(config: ClickOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-clickoverlay',
        role: this.config.role,
      },
      <ClickOverlayConfig>this.config,
    );
  }

  initialize(): void {
    super.initialize();

    this.setUrl((<ClickOverlayConfig>this.config).url);
    const element = this.getDomElement();
    element.on('click', () => {
      ClickThroughUtils.open(element.data('url'));
    });
  }

  /**
   * Gets the URL that should be followed when the watermark is clicked.
   * @returns {string} the watermark URL
   */
  getUrl(): string {
    return this.getDomElement().data('url');
  }

  setUrl(url: string): void {
    if (url === undefined || url == null) {
      url = '';
    }
    this.getDomElement().data('url', url);
  }
}

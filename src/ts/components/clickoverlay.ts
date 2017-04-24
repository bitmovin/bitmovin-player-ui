import {Button, ButtonConfig} from './button';

/**
 * Configuration interface for a {@link ClickOverlay}.
 */
export interface ClickOverlayConfig extends ButtonConfig {
  /**
   * The url to open when the overlay is clicked. Set to null to disable the click handler.
   */
  url?: string;
}

/**
 * A click overlay that opens an url in a new tab if clicked.
 */
export class ClickOverlay extends Button<ClickOverlayConfig> {

  constructor(config: ClickOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-clickoverlay'
    }, <ClickOverlayConfig>this.config);
  }

  initialize(): void {
    super.initialize();

    this.setUrl((<ClickOverlayConfig>this.config).url);
    let element = this.getDomElement();
    element.on('click', () => {
      if (element.data('url')) {
        window.open(element.data('url'), '_blank');
      }
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
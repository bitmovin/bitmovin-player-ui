import { ClickOverlay, ClickOverlayConfig } from './overlays/ClickOverlay';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link ClickOverlay}.
 *
 * @category Configs
 */
export interface WatermarkConfig extends ClickOverlayConfig {
  // nothing yet
}

/**
 * A watermark overlay with a clickable logo.
 *
 * @category Components
 */
export class Watermark extends ClickOverlay {
  constructor(config: WatermarkConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-watermark',
        url: 'http://bitmovin.com',
        role: 'link',
        text: 'logo',
        // The Bitmovin-specific name only fits the default URL
        ariaLabel: i18n.getLocalizer(config.url ? 'watermarkLink' : 'watermarkLink.bitmovin'),
      },
      <WatermarkConfig>this.config,
    );
  }
}

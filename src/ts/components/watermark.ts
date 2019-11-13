import {ClickOverlay, ClickOverlayConfig} from './clickoverlay';

/**
 * Configuration interface for a {@link ClickOverlay}.
 */
export interface WatermarkConfig extends ClickOverlayConfig {
  // nothing yet
}

/**
 * A watermark overlay with a clickable logo.
 */
export class Watermark extends ClickOverlay {

  constructor(config: WatermarkConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-watermark',
      url: 'http://bitmovin.com',
      role: 'img',
      text: 'bitmovin-logo'
    }, <WatermarkConfig>this.config);
  }
}
import { ClickOverlay, ClickOverlayConfig } from './overlays/ClickOverlay';
import { i18n, LocalizableText, Localizer } from '../localization/i18n';

const BITMOVIN_URL = 'http://bitmovin.com';

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
  /** Whether the integrator supplied the accessible name, in the config or later through {@link setAriaLabel}. */
  private hasCustomAriaLabel: boolean;

  constructor(config: WatermarkConfig = {}) {
    super(config);

    this.hasCustomAriaLabel = config.ariaLabel != null;

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-watermark',
        url: BITMOVIN_URL,
        role: 'link',
        text: 'logo',
        ariaLabel: Watermark.getAutomaticAriaLabel(config.url || BITMOVIN_URL),
      },
      <WatermarkConfig>this.config,
    );
  }

  setUrl(url: string): void {
    super.setUrl(url);

    // Keep the automatic name in line with the link target. A name the integrator supplied is left untouched.
    if (!this.hasCustomAriaLabel) {
      super.setAriaLabel(Watermark.getAutomaticAriaLabel(this.getUrl()));
    }
  }

  setAriaLabel(label: LocalizableText): void {
    super.setAriaLabel(label);
    this.hasCustomAriaLabel = true;
  }

  protected onLanguageChanged(): void {
    super.onLanguageChanged();
    if (!this.hasCustomAriaLabel) {
      super.setAriaLabel(Watermark.getAutomaticAriaLabel(this.getUrl()));
    }
  }

  /**
   * The Bitmovin-specific name only fits the Bitmovin URL; any other URL gets a generic name.
   */
  private static getAutomaticAriaLabel(url: string): Localizer {
    return i18n.getLocalizer(url === BITMOVIN_URL ? 'watermarkLink.bitmovin' : 'watermarkLink');
  }
}

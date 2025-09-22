import { Component, ComponentConfig } from './Component';
import { i18n, LocalizableText } from '../localization/i18n';
import { DOM } from '../DOM';

export interface IconConfig extends ComponentConfig {
  /**
   * WCAG20 standard for defining info about the component (usually the name)
   */
  ariaLabel?: LocalizableText;
  /**
   * Alternative text for the icon, used for accessibility (e.g., screen readers).
   */
  altText?: LocalizableText;
}

export class Icon extends Component<IconConfig> {
  constructor(config: IconConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-icon',
      } as IconConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    return new DOM('div', {
      class: this.getCssClasses(),
      'aria-label': i18n.performLocalization(this.config.ariaLabel || this.config.altText),
    });
  }
}

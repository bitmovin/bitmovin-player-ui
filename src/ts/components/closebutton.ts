import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for the {@link CloseButton}.
 */
export interface CloseButtonConfig extends ButtonConfig {
  /**
   * The component that should be closed when the button is clicked.
   */
  target: Component<ComponentConfig>;
}

/**
 * A button that closes (hides) a configured component.
 */
export class CloseButton extends Button<CloseButtonConfig> {

  constructor(config: CloseButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-closebutton',
      text: i18n.getLocalizer('close'),
      ariaLabel: i18n.getLocalizer('close'),
    } as CloseButtonConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    this.onClick.subscribe(() => {
      config.target.hide();
    });
  }
}
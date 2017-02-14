import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';

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
      text: 'Close'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <CloseButtonConfig>this.getConfig();

    this.onClick.subscribe(() => {
      config.target.hide();
    });
  }
}
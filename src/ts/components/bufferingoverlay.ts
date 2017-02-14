import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';

/**
 * Overlays the player and displays a buffering indicator.
 */
export class BufferingOverlay extends Container<ContainerConfig> {

  private indicators: Component<ComponentConfig>[];

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.indicators = [
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
    ];

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-buffering-overlay',
      hidden: true,
      components: this.indicators
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.addEventHandler(player.EVENT.ON_STALL_STARTED, () => {
      this.show();
    });
    player.addEventHandler(player.EVENT.ON_STALL_ENDED, () => {
      this.hide();
    });
  }
}

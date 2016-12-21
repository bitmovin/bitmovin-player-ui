import {ContainerConfig, Container} from './container';
import {UIManager} from '../uimanager';
import {Component, ComponentConfig} from './component';

/**
 * Overlays the player and displays a buffering indicator.
 */
export class BufferingOverlay extends Container<ContainerConfig> {

  private indicators: Component<ComponentConfig>[];

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.indicators = [
      new Component<ComponentConfig>({tag: 'div', cssClass: 'ui-buffering-overlay-indicator'}),
      new Component<ComponentConfig>({tag: 'div', cssClass: 'ui-buffering-overlay-indicator'}),
      new Component<ComponentConfig>({tag: 'div', cssClass: 'ui-buffering-overlay-indicator'}),
    ];

    this.config = this.mergeConfig(config, {
      cssClass  : 'ui-buffering-overlay',
      hidden    : true,
      components: this.indicators
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    player.addEventHandler(bitmovin.player.EVENT.ON_STALL_STARTED, function() {
      self.show();
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, function() {
      self.hide();
    });
  }
}

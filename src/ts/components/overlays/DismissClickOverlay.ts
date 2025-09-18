import { ButtonConfig } from '../buttons/Button';
import { Component, ComponentConfig } from '../Component';
import { Container } from '../Container';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';

export interface DismissClickOverlayConfig extends ButtonConfig {
  target: Component<ComponentConfig>;
}

export class DismissClickOverlay extends Container<DismissClickOverlayConfig> {
  constructor(config: DismissClickOverlayConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-dismiss-click-overlay',
      role: this.config.role,
    }, <DismissClickOverlayConfig>this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    this.config.target.onShow.subscribe(() => { this.show(); });
    this.config.target.onHide.subscribe(() => { this.hide(); });

    let element = this.getDomElement();
    element.on('click', () => {
      this.config.target.hide();
    });
  }
}

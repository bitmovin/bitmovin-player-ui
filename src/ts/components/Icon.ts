import { Component, ComponentConfig } from './Component';
import { DOM } from '../DOM';

export class Icon extends Component<ComponentConfig> {
  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-icon',
      } as ComponentConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    return new DOM('div', {
      class: this.getCssClasses()
    });
  }
}

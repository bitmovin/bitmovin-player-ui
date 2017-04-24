import {Component, ComponentConfig} from './component';

/**
 * A dummy component that just reserves some space and does nothing else.
 */
export class Spacer extends Component<ComponentConfig> {

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-spacer',
    }, this.config);
  }


  protected onShowEvent(): void {
    // disable event firing by overwriting and not calling super
  }

  protected onHideEvent(): void {
    // disable event firing by overwriting and not calling super
  }

  protected onHoverChangedEvent(hovered: boolean): void {
    // disable event firing by overwriting and not calling super
  }
}
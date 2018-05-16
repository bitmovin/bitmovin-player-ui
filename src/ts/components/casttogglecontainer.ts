import {Container, ContainerConfig} from './container';
import {CastIntro} from './castintro';
import {CastToggleButton} from './casttogglebutton';

/**
 * A button that toggles casting to a Cast receiver.
 */
export class CastToggleContainer extends Container<ContainerConfig> {

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-casttogglebutton-container',
      components: [
        new CastToggleButton,
        new CastIntro(),
      ],
    }, this.config);
  }
}
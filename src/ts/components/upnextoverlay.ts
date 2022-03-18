import {Container, ContainerConfig} from './container';
import {UpNextButton} from './upnextbutton';

/**
 * Overlays the player and displays error messages.
 */
export class UpNextOverlay extends Container<ContainerConfig> {

  private upNextButton: UpNextButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.upNextButton = new UpNextButton();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-upnext-overlay',
      components: [this.upNextButton],
    }, this.config);
  }
}
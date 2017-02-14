import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';

/**
 * Configuration interface for the {@link ControlBar}.
 */
export interface ControlBarConfig extends ContainerConfig {
  // nothing yet
}

/**
 * A container for main player control components, e.g. play toggle button, seek bar, volume control, fullscreen toggle
 * button.
 */
export class ControlBar extends Container<ControlBarConfig> {

  constructor(config: ControlBarConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controlbar',
      hidden: true,
    }, <ControlBarConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    uimanager.onControlsShow.subscribe(() => {
      this.show();
    });
    uimanager.onControlsHide.subscribe(() => {
      this.hide();
    });
  }
}
import {ContainerConfig, Container} from './container';
import {UIManager} from '../uimanager';

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

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    uimanager.onControlsShow.subscribe(function () {
      self.show();
    });
    uimanager.onControlsHide.subscribe(function () {
      self.hide();
    });
  }
}
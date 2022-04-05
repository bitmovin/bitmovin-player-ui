import {Container, ContainerConfig} from './container';
import {HugePlaybackToggleButton} from './hugeplaybacktogglebutton';
import { PlaybackToggleButton } from './playbacktogglebutton';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Overlays the player and displays error messages.
 */
export class PlaybackToggleOverlay extends Container<ContainerConfig> {

  private playbackToggleButton: PlaybackToggleButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    // Replace huge button which takes the full screen with a small one
    this.playbackToggleButton = new PlaybackToggleButton();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playbacktoggle-overlay',
      components: [this.playbackToggleButton],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Hide only the button accordingly (not the container: this)
    uimanager.onControlsHide.subscribe(() => {
      this.playbackToggleButton.hide();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.playbackToggleButton.show();
    });
  }
}

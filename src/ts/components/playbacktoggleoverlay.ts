import {Container, ContainerConfig} from './container';
import {HugePlaybackToggleButton} from './hugeplaybacktogglebutton';

/**
 * @category Configs
 */
export interface PlaybackToggleOverlayConfig extends ContainerConfig {
  /**
   * Specify whether the player should be set to enter fullscreen by clicking on the playback toggle button
   * when initiating the initial playback.
   * Default is false.
   */
  enterFullscreenOnInitialPlayback?: boolean;
}

/**
 * Overlays the player and displays error messages.
 *
 * @category Components
 */
export class PlaybackToggleOverlay extends Container<PlaybackToggleOverlayConfig> {

  private playbackToggleButton: HugePlaybackToggleButton;

  constructor(config: PlaybackToggleOverlayConfig = {}) {
    super(config);

    this.playbackToggleButton = new HugePlaybackToggleButton({
      enterFullscreenOnInitialPlayback: Boolean(config.enterFullscreenOnInitialPlayback),
    });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playbacktoggle-overlay',
      components: [this.playbackToggleButton],
    }, this.config);
  }
}
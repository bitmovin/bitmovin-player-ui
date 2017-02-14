import {SeekBar, SeekBarConfig} from './seekbar';
import {UIInstanceManager} from '../uimanager';

/**
 * A simple volume slider component to adjust the player's volume setting.
 */
export class VolumeSlider extends SeekBar {

  constructor(config: SeekBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-volumeslider'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager, false);

    let volumeChangeHandler = () => {
      if (player.isMuted()) {
        this.setPlaybackPosition(0);
        this.setBufferPosition(0);
      } else {
        this.setPlaybackPosition(player.getVolume());

        this.setBufferPosition(player.getVolume());
      }
    };

    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, volumeChangeHandler);
    player.addEventHandler(player.EVENT.ON_MUTED, volumeChangeHandler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, volumeChangeHandler);

    this.onSeekPreview.subscribe((sender, args) => {
      if (args.scrubbing) {
        player.setVolume(args.position);
      }
    });
    this.onSeeked.subscribe((sender, percentage) => {
      player.setVolume(percentage);
    });

    // Update the volume slider marker when the player resized or the UI is configured.
    // Check the seekbar for a detailed description.
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, () => {
      this.refreshPlaybackPosition();
    });
    uimanager.onConfigured.subscribe(() => {
      this.refreshPlaybackPosition();
    });

    // Init volume bar
    volumeChangeHandler();
  }
}
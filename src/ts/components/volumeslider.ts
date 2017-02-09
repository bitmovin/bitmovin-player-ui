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

    let self = this;

    let volumeChangeHandler = function() {
      if (player.isMuted()) {
        self.setPlaybackPosition(0);
        self.setBufferPosition(0);
      } else {
        self.setPlaybackPosition(player.getVolume());

        self.setBufferPosition(player.getVolume());
      }
    };

    player.addEventHandler(player.EVENT.ON_VOLUME_CHANGED, volumeChangeHandler);
    player.addEventHandler(player.EVENT.ON_MUTED, volumeChangeHandler);
    player.addEventHandler(player.EVENT.ON_UNMUTED, volumeChangeHandler);

    this.onSeekPreview.subscribe(function(sender, args) {
      if (args.scrubbing) {
        player.setVolume(args.position);
      }
    });
    this.onSeeked.subscribe(function(sender, percentage) {
      player.setVolume(percentage);
    });

    // Update the volume slider marker when the player resized or the UI is configured.
    // Check the seekbar for a detailed description.
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, function() {
      self.refreshPlaybackPosition();
    });
    uimanager.onConfigured.subscribe(function() {
      self.refreshPlaybackPosition();
    });

    // Init volume bar
    volumeChangeHandler();
  }
}
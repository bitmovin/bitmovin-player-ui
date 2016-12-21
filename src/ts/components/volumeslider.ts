import {SeekBar, SeekBarConfig} from './seekbar';
import {UIManager} from '../uimanager';

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

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
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

    player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGED, volumeChangeHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_MUTED, volumeChangeHandler);
    player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTED, volumeChangeHandler);

    this.onSeekPreview.subscribe(function(sender, args) {
      if (args.scrubbing) {
        player.setVolume(args.position);
      }
    });
    this.onSeeked.subscribe(function(sender, percentage) {
      player.setVolume(percentage);
    });

    // Init volume bar
    volumeChangeHandler();
  }
}
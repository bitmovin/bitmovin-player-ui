import {SeekBar, SeekBarConfig} from './seekbar';
import {UIInstanceManager} from '../uimanager';
import {Timeout} from '../timeout';

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

    player.addEventHandler(bitmovin.player.EVENT.ON_PLAYER_RESIZE, function() {
      self.refreshPlaybackPosition();
    });

    // Init volume bar
    volumeChangeHandler();

    // TODO find a better solution for this hack
    /* At the time where this is called, the DOM element does not have a size yet, resulting in a zero offset of the
     * volume slider knob, no matter what the actual volume setting on the player is. Out of lack of a way to
     * detect when the element gets its size, we use this hack that actually seems to work on all browsers.
     */
    new Timeout(1, function () {
      self.refreshPlaybackPosition();
    }).start();
  }
}
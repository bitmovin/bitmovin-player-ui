import {SeekBar, SeekBarConfig} from './seekbar';
import {UIInstanceManager} from '../uimanager';

/**
 * Configuration interface for the {@link VolumeSlider} component.
 */
export interface VolumeSliderConfig extends SeekBarConfig {
  /**
   * Specifies if the volume slider should be automatically hidden when volume control is prohibited by the
   * browser or platform. This currently only applies to iOS.
   * Default: true
   */
  hideIfVolumeControlProhibited: boolean;
}

/**
 * A simple volume slider component to adjust the player's volume setting.
 */
export class VolumeSlider extends SeekBar {

  constructor(config: SeekBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <VolumeSliderConfig>{
      cssClass: 'ui-volumeslider',
      hideIfVolumeControlProhibited: true,
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager, false);

    let config = <VolumeSliderConfig>this.getConfig();

    if (config.hideIfVolumeControlProhibited && !this.detectVolumeControlAvailability(player)) {
      this.hide();

      // We can just return from here, because the user will never interact with the control and any configured
      // functionality would only eat resources for no reason.
      return;
    }

    let volumeChangeHandler = () => {
      if (player.isMuted()) {
        this.setPlaybackPosition(0);
        this.setBufferPosition(0);
      } else {
        this.setPlaybackPosition(player.getVolume());

        this.setBufferPosition(player.getVolume());
      }
    };

    player.addEventHandler(player.EVENT.ON_READY, volumeChangeHandler);
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

    // Update the volume slider marker when the player resized, a source is loaded and player is ready,
    // or the UI is configured. Check the seekbar for a detailed description.
    player.addEventHandler(player.EVENT.ON_PLAYER_RESIZE, () => {
      this.refreshPlaybackPosition();
    });
    player.addEventHandler(player.EVENT.ON_READY, () => {
      this.refreshPlaybackPosition();
    });
    uimanager.onConfigured.subscribe(() => {
      this.refreshPlaybackPosition();
    });

    // Init volume bar
    volumeChangeHandler();
  }

  private detectVolumeControlAvailability(player: bitmovin.player.Player): boolean {
    // Store current player state so we can restore it later
    let volume = player.getVolume();
    let muted = player.isMuted();
    let playing = player.isPlaying();

    /*
     * "On iOS devices, the audio level is always under the user’s physical control. The volume property is not
     * settable in JavaScript. Reading the volume property always returns 1."
     * https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
     *
     * Our player API returns a volume range of [0, 100] so we need to check for 100 instead of 1.
     */

    // Only if the volume is 100, there's the possibility we are on a volume-control-restricted iOS device
    if (volume === 100) {
      // We set the volume to zero (that's the only value that does not unmute a muted player!)
      player.setVolume(0);
      // Then we check if the value is still 100
      if (player.getVolume() === 100) {
        // If the volume stayed at 100, we're on a volume-control-restricted device
        return false;
      } else {
        // We can control volume, so we must restore the previous player state
        player.setVolume(volume);
        if (muted) {
          player.mute();
        }
        if (playing) {
          // The volume restore above pauses autoplay on mobile devices (e.g. Android) so we need to resume playback
          // (We cannot check isPaused() here because it is not set when playback is prohibited by the mobile platform)
          player.play();
        }
        return true;
      }
    } else {
      // Volume is not 100, so we're definitely not on a volume-control-restricted iOS device
      return true;
    }
  }
}
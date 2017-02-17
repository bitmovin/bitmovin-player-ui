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

  private detectVolumeControlAvailability(player: bitmovin.player.Player): boolean {
    // Store current volume so we can restore it later
    let currentVolume = player.getVolume();

    /*
     * "On iOS devices, the audio level is always under the user’s physical control. The volume property is not
     * settable in JavaScript. Reading the volume property always returns 1."
     * https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
     *
     * We can detect such an iOS device by setting the volume to 50 (translates to 0.5 on the video element)
     * and then checking if it is set to 50 (volume control supported) or 100 (the readonly default volume of 1,
     * meaning volume control prohibited).
     */
    player.setVolume(50);
    if (player.getVolume() === 100) {
      return false;
    } else {
      player.setVolume(currentVolume); // Restore volume
      return true;
    }
  }
}
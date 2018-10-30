import {SeekBar, SeekBarConfig} from './seekbar';
import {UIInstanceManager} from '../uimanager';
import { VolumeController } from '../volumecontroller';

/**
 * Configuration interface for the {@link VolumeSlider} component.
 */
export interface VolumeSliderConfig extends SeekBarConfig {
  /**
   * Specifies if the volume slider should be automatically hidden when volume control is prohibited by the
   * browser or platform. This currently only applies to iOS.
   * Default: true
   */
  hideIfVolumeControlProhibited?: boolean;
}

/**
 * A simple volume slider component to adjust the player's volume setting.
 */
export class VolumeSlider extends SeekBar {

  constructor(config: VolumeSliderConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <VolumeSliderConfig>{
      cssClass: 'ui-volumeslider',
      hideIfVolumeControlProhibited: true,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager, false);

    let config = <VolumeSliderConfig>this.getConfig();

    const volumeController = uimanager.getConfig().volumeController;

    if (config.hideIfVolumeControlProhibited && !this.detectVolumeControlAvailability()) {
      this.hide();

      // We can just return from here, because the user will never interact with the control and any configured
      // functionality would only eat resources for no reason.
      return;
    }

    volumeController.onChanged.subscribe((_, args) => {
      if (args.muted) {
        this.setPlaybackPosition(0);
      } else {
        this.setPlaybackPosition(args.volume);
      }
    });

    this.onSeek.subscribe(() => {
      // Store the volume at the beginning of a volume seek so we can recall it later in case we set the volume to
      // zero and actually mute the player.
      volumeController.storeVolume();
    });
    this.onSeekPreview.subscribeRateLimited((sender, args) => {
      if (args.scrubbing) {
        // Update the volume while seeking so the user has a "live preview" of the target volume
        volumeController.setVolume(args.position);
      }
    }, 50);
    this.onSeeked.subscribe((sender, percentage) => {
      if (percentage === 0) {
        // When the volume is zero we essentially mute the volume so we recall the volume from the beginning of the
        // seek operation and mute the player instead. Recalling is necessary to return to the actual audio volume
        // when unmuting.
        volumeController.recallVolume();
        volumeController.setMuted(true);
      } else {
        volumeController.setVolume(percentage);
      }
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

    // Init
    volumeController.onChangedEvent();
  }

  private detectVolumeControlAvailability(): boolean {
    /*
     * "On iOS devices, the audio level is always under the user’s physical control. The volume property is not
     * settable in JavaScript. Reading the volume property always returns 1."
     * https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
     */
    // as muted autoplay gets paused as soon as we unmute it, we may not touch the volume of the actual player so we
    // probe a dummy audio element
    const dummyVideoElement = document.createElement('video');
    // try setting the volume to 0.7 and if it's still 1 we are on a volume control restricted device
    dummyVideoElement.volume = 0.7;
    return dummyVideoElement.volume !== 1;
  }
}

import {SeekBar, SeekBarConfig} from './seekbar';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { VolumeTransition } from '../volumecontroller';

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

  private static readonly issuerName = 'ui';

  constructor(config: VolumeSliderConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <VolumeSliderConfig>{
      cssClass: 'ui-volumeslider',
      hideIfVolumeControlProhibited: true,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
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

    let volumeTransition: VolumeTransition;

    this.onSeek.subscribe(() => {
      volumeTransition = volumeController.startTransition();
    });
    this.onSeekPreview.subscribeRateLimited((sender, args) => {
      if (args.scrubbing && volumeTransition) {
        volumeTransition.update(args.position);
      }
    }, 50);
    this.onSeeked.subscribe((sender, percentage) => {
      if (volumeTransition) {
        volumeTransition.finish(percentage);
      }
    });

    // Update the volume slider marker when the player resized, a source is loaded,
    // or the UI is configured. Check the seekbar for a detailed description.
    player.on(player.exports.PlayerEvent.PlayerResized, () => {
      this.refreshPlaybackPosition();
    });
    uimanager.onConfigured.subscribe(() => {
      this.refreshPlaybackPosition();
    });

    uimanager.getConfig().events.onUpdated.subscribe(() => {
      this.refreshPlaybackPosition();
    });

    uimanager.onComponentShow.subscribe(() => {
      this.refreshPlaybackPosition();
    });
    uimanager.onComponentHide.subscribe(() => {
      this.refreshPlaybackPosition();
    });

    // Init volume bar
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

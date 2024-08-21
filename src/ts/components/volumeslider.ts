import { SeekBar, SeekBarConfig, SeekPreviewEventArgs } from './seekbar';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { VolumeTransition } from '../volumecontroller';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for the {@link VolumeSlider} component.
 *
 * @category Configs
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
 *
 * @category Components
 */
export class VolumeSlider extends SeekBar {
  private volumeTransition: VolumeTransition;

  constructor(config: VolumeSliderConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <VolumeSliderConfig>{
      cssClass: 'ui-volumeslider',
      hideIfVolumeControlProhibited: true,
      ariaLabel: i18n.getLocalizer('settings.audio.volume'),
      tabIndex: 0,
    }, this.config);
  }

  private setVolumeAriaSliderValues(value: number) {
    this.getDomElement().attr('aria-valuenow', Math.ceil(value).toString());
    this.getDomElement().attr('aria-valuetext', `${i18n.performLocalization(i18n.getLocalizer('seekBar.value'))}: ${Math.ceil(value)}`);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager, false);

    this.setAriaSliderMinMax('0', '100');

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
        this.setVolumeAriaSliderValues(0);
        this.setPlaybackPosition(0);
      } else {
        this.setPlaybackPosition(args.volume);
        this.setVolumeAriaSliderValues(args.volume);
      }
    });

    this.onSeek.subscribe(() => {
      this.volumeTransition = volumeController.startTransition();
    });

    this.onSeekPreview.subscribeRateLimited(this.updateVolumeWhileScrubbing, 50);
    this.onSeeked.subscribe((sender, percentage) => {
      if (this.volumeTransition) {
        this.volumeTransition.finish(percentage);
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

  private updateVolumeWhileScrubbing = (sender: VolumeSlider, args: SeekPreviewEventArgs) => {
    if (args.scrubbing && this.volumeTransition) {
      this.volumeTransition.update(args.position);
    }
  };

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

  release(): void {
    super.release();

    this.onSeekPreview.unsubscribe(this.updateVolumeWhileScrubbing);
  }
}

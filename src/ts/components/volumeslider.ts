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

  private static readonly issuerName = 'ui';

  /**
   * Small MP3 from https://mrcoles.com/detecting-html5-audio-autoplay/
   * @type {string}
   */
  public static readonly dummyAudioSource: string = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+R' +
    'hST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///' +
    '3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq' +
    'qqqqqqqqqqqqqqqqqqqqqqqqq';


  constructor(config: SeekBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <VolumeSliderConfig>{
      cssClass: 'ui-volumeslider',
      hideIfVolumeControlProhibited: true,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
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

    this.onSeekPreview.subscribeRateLimited((sender, args) => {
      if (args.scrubbing) {
        player.setVolume(args.position, VolumeSlider.issuerName);
      }
    }, 50);
    this.onSeeked.subscribe((sender, percentage) => {
      player.setVolume(percentage, VolumeSlider.issuerName);
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

  private detectVolumeControlAvailability(player: bitmovin.PlayerAPI): boolean {
    /*
     * "On iOS devices, the audio level is always under the user’s physical control. The volume property is not
     * settable in JavaScript. Reading the volume property always returns 1."
     * https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
     */
    // as muted autoplay gets paused as soon as we unmute it, we may not touch the volume of the actual player so we
    // probe a dummy video element with a minimal audio source
    const dummyVideoElement = document.createElement('video');
    const dummyAudioSource = document.createElement('source');
    dummyAudioSource.src = VolumeSlider.dummyAudioSource;
    dummyVideoElement.appendChild(dummyAudioSource);
    // try setting the volume to 0.9 and if it's still 1 we are on a volume control restricted device
    dummyVideoElement.volume = 0.9;
    // alert('volume after alteration: ' + dummyVideoElement.volume);
    return dummyVideoElement.volume !== 1;
  }
}

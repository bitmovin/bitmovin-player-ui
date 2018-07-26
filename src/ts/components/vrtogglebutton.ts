import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import PlayerEvent = bitmovin.PlayerAPI.PlayerEvent;
import WarningEvent = bitmovin.PlayerAPI.WarningEvent;

/**
 * A button that toggles the video view between normal/mono and VR/stereo.
 */
export class VRToggleButton extends ToggleButton<ToggleButtonConfig> {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-vrtogglebutton',
      text: 'VR',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let isVRConfigured = () => {
      // VR availability cannot be checked through getVRStatus() because it is asynchronously populated and not
      // available at UI initialization. As an alternative, we check the VR settings in the config.
      // TODO use getVRStatus() through isVRStereoAvailable() once the player has been rewritten and the status is
      // available in Ready
      let config = player.getConfig();
      return config.source && config.source.vr && config.source.vr.contentType !== 'none';
    };

    let isVRStereoAvailable = () => {
      return player.getVRStatus().contentType !== 'none';
    };

    let vrStateHandler = (ev: PlayerEvent) => {
      if (ev.type === player.Event.Warning && (ev as WarningEvent).code !== 5006) {
        // a code of 5006 signals a VR Error, so don't do anything on other warnings
        return;
      }

      if (isVRConfigured() && isVRStereoAvailable()) {
        this.show(); // show button in case it is hidden

        if (player.getVRStatus().isStereo) {
          this.on();
        } else {
          this.off();
        }
      } else {
        this.hide(); // hide button if no stereo mode available
      }
    };

    let vrButtonVisibilityHandler = () => {
      if (isVRConfigured()) {
        this.show();
      } else {
        this.hide();
      }
    };

    player.addEventHandler(player.Event.VRStereoChanged, vrStateHandler);
    player.addEventHandler(player.Event.Warning, vrStateHandler);
    // Hide button when VR source goes away
    player.addEventHandler(player.Event.SourceUnloaded, vrButtonVisibilityHandler);
    // Show button when a new source is loaded and it's VR
    player.addEventHandler(player.Event.Ready, vrButtonVisibilityHandler);

    this.onClick.subscribe(() => {
      if (!isVRStereoAvailable()) {
        if (console) {
          console.log('No VR content');
        }
      } else {
        if (player.getVRStatus().isStereo) {
          player.setVRStereo(false);
        } else {
          player.setVRStereo(true);
        }
      }
    });

    // Set startup visibility
    vrButtonVisibilityHandler();
  }
}
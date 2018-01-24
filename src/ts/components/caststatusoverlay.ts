import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import CastWaitingForDeviceEvent = bitmovin.PlayerAPI.CastWaitingForDeviceEvent;
import CastStartedEvent = bitmovin.PlayerAPI.CastStartedEvent;
import i18n from '../i18n';

/**
 * Overlays the player and displays the status of a Cast session.
 */
export class CastStatusOverlay extends Container<ContainerConfig> {

  private statusLabel: Label<LabelConfig>;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.statusLabel = new Label<LabelConfig>({ cssClass: 'ui-cast-status-label' });

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-cast-status-overlay',
      components: [this.statusLabel],
      hidden: true,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.addEventHandler(player.EVENT.ON_CAST_WAITING_FOR_DEVICE,
      (event: CastWaitingForDeviceEvent) => {
        this.show();
        // Get device name and update status text while connecting
        let castDeviceName = event.castPayload.deviceName;
        this.statusLabel.setText(i18n.q.messages.connectingTo(castDeviceName));
      });
    player.addEventHandler(player.EVENT.ON_CAST_STARTED, (event: CastStartedEvent) => {
      // Session is started or resumed
      // For cases when a session is resumed, we do not receive the previous events and therefore show the status panel
      // here too
      this.show();
      let castDeviceName = event.deviceName;
      this.statusLabel.setText(i18n.q.messages.playingOn(castDeviceName));
    });
    player.addEventHandler(player.EVENT.ON_CAST_STOPPED, (event) => {
      // Cast session gone, hide the status panel
      this.hide();
    });
  }
}
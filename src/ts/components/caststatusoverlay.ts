import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI, Events } from 'bitmovin-player';

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

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.on(player.exports.Event.CastWaitingForDevice,
      (event: Events.CastWaitingForDeviceEvent) => {
        this.show();
        // Get device name and update status text while connecting
        let castDeviceName = event.castPayload.deviceName;
        this.statusLabel.setText(`Connecting to <strong>${castDeviceName}</strong>...`);
      });
    player.on(player.exports.Event.CastStarted, (event: Events.CastStartedEvent) => {
      // Session is started or resumed
      // For cases when a session is resumed, we do not receive the previous events and therefore show the status panel
      // here too
      this.show();
      let castDeviceName = event.deviceName;
      this.statusLabel.setText(`Playing on <strong>${castDeviceName}</strong>`);
    });
    player.on(player.exports.Event.CastStopped, (event) => {
      // Cast session gone, hide the status panel
      this.hide();
    });
  }
}
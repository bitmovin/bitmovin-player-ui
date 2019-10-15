import {ContainerConfig, Container} from './container';
import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import { CastStartedEvent, CastWaitingForDeviceEvent, PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

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

    player.on(player.exports.PlayerEvent.CastWaitingForDevice,
      (event: CastWaitingForDeviceEvent) => {
        this.show();
        // Get device name and update status text while connecting
        let castDeviceName = event.castPayload.deviceName;
        this.statusLabel.setText(`Connecting to <strong>${castDeviceName}</strong>...`);
      });
    player.on(player.exports.PlayerEvent.CastStarted, (event: CastStartedEvent) => {
      // Session is started or resumed
      // For cases when a session is resumed, we do not receive the previous events and therefore show the status panel
      // here too
      this.show();
      let castDeviceName = event.deviceName;
      this.statusLabel.setText(i18n.t('playingOn', { castDeviceName }));
    });
    player.on(player.exports.PlayerEvent.CastStopped, (event) => {
      // Cast session gone, hide the status panel
      this.hide();
    });
  }
}
import {ContainerConfig, Container} from "./container";
import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";
import CastWaitingForDeviceEvent = bitmovin.player.CastWaitingForDeviceEvent;
import CastLaunchedEvent = bitmovin.player.CastLaunchedEvent;
import CastStoppedEvent = bitmovin.player.CastStoppedEvent;

/**
 * Overlays the player and displays the status of a Cast session.
 */
export class CastStatusOverlay extends Container<ContainerConfig> {

    private statusLabel: Label<LabelConfig>;

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.statusLabel = new Label<LabelConfig>({cssClass: "ui-cast-status-label"});

        this.config = this.mergeConfig(config, {
            cssClass: "ui-cast-status-overlay",
            components: [this.statusLabel],
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;
        let castDeviceName = "unknown";

        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, function (event) {
            // Show Cast status when a session is being started
            self.show();
            self.statusLabel.setText("Select a Cast device");
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_WAITING_FOR_DEVICE, function (event: CastWaitingForDeviceEvent) {
            // Get device name and update status text while connecting
            castDeviceName = event.castPayload.deviceName;
            self.statusLabel.setText(`Connecting to <strong>${castDeviceName}</strong>...`);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, function (event: CastLaunchedEvent) {
            // Session is started or resumed
            // For cases when a session is resumed, we do not receive the previous events and therefore show the status panel here too
            self.show();
            self.statusLabel.setText(`Playing on <strong>${castDeviceName}</strong>`);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOPPED, function (event: CastStoppedEvent) {
            // Cast session gone, hide the status panel
            self.hide();
        });
    }
}
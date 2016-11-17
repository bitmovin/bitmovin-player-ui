import {ContainerConfig, Container} from "./container";
import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";
import CastWaitingForDeviceEvent = bitmovin.player.CastWaitingForDeviceEvent;
import CastLaunchedEvent = bitmovin.player.CastLaunchedEvent;
import CastStoppedEvent = bitmovin.player.CastStoppedEvent;

export class CastStatusFrame extends Container<ContainerConfig> {

    private statusLabel: Label<LabelConfig>;

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.statusLabel = new Label<LabelConfig>({cssClass: 'ui-cast-status-label'});

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-cast-status-frame',
            components: [this.statusLabel],
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let activeCastDevice = null;

        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_START, function (event) {
            self.show();
            self.statusLabel.setText("Select a Cast device");
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_WAITING_FOR_DEVICE, function (event: CastWaitingForDeviceEvent) {
            self.statusLabel.setText(`Connecting to <strong>${event.castPayload.deviceName}</strong>...`);
            activeCastDevice = event.castPayload;
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, function (event: CastLaunchedEvent) {
            if(activeCastDevice) {
                self.statusLabel.setText(`Playing on <strong>${activeCastDevice.deviceName}</strong>`);
            }
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOP, function (event: CastStoppedEvent) {
            self.hide();
        });
    }
}
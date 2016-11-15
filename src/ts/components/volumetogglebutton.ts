import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {UIManager} from "../uimanager";

export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumetogglebutton',
            text: 'Volume/Mute'
        }, this.config);
    }


    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let muteStateHandler = function () {
            if (player.isMuted()) {
                self.on();
            } else {
                self.off();
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_MUTE, muteStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, muteStateHandler);

        self.onClick.subscribe(function () {
            if (player.isMuted()) {
                player.unmute();
            } else {
                player.mute();
            }
        });
    }
}
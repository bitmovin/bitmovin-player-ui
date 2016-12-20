import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {UIManager} from "../uimanager";

/**
 * A button that toggles casting to a Cast receiver.
 */
export class CastToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: "ui-casttogglebutton",
            text: "Google Cast"
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        self.onClick.subscribe(function () {
            if (player.isCastAvailable()) {
                if (player.isCasting()) {
                    player.castStop();
                } else {
                    player.castVideo();
                }
            } else {
                if (console) console.log("Cast unavailable");
            }
        });

        let castAvailableHander = function () {
            if (player.isCastAvailable()) {
                self.show();
            } else {
                self.hide();
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_AVAILABLE, castAvailableHander);

        // Toggle button "on" state
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, function () {
            self.on();
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOPPED, function () {
            self.off();
        });

        // Startup init
        castAvailableHander(); // Hide button if Cast not available
        if (player.isCasting()) {
            self.on();
        }
    }
}
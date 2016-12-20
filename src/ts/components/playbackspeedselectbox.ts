import {SelectBox} from "./selectbox";
import {ListSelectorConfig} from "./listselector";
import {UIManager} from "../uimanager";

/**
 * A select box providing a selection of different playback speeds.
 */
export class PlaybackSpeedSelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        self.addItem("0.25", "0.25x");
        self.addItem("0.5", "0.5x");
        self.addItem("1", "Normal");
        self.addItem("1.5", "1.5x");
        self.addItem("2", "2x");

        self.selectItem("1");


        self.onItemSelected.subscribe(function (sender: PlaybackSpeedSelectBox, value: string) {
            player.setPlaybackSpeed(parseFloat(value));
        });
    }
}
import {SelectBox} from "./selectbox";
import {ListSelectorConfig} from "./listselector";
import {UIManager} from "../uimanager";

export class VideoQualitySelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let videoQualities = player.getAvailableVideoQualities();

        // Add entry for automatic quality switching (default setting)
        self.addItem("auto", "auto");

        // Add video qualities
        for(let videoQuality of videoQualities) {
            self.addItem(videoQuality.id, videoQuality.label);
        }

        self.onItemSelected.subscribe(function(sender: VideoQualitySelectBox, value: string) {
            player.setVideoQuality(value);
        });

        // TODO update videoQualitySelectBox when video quality is changed from outside (through the API)
        // TODO implement ON_VIDEO_QUALITY_CHANGED event in player API
    }
}
import {SelectBox} from "./selectbox";
import {ListSelectorConfig} from "./listselector";
import {UIManager} from "../uimanager";
import SubtitleAddedEvent = bitmovin.player.SubtitleAddedEvent;
import SubtitleChangedEvent = bitmovin.player.SubtitleChangedEvent;
import SubtitleRemovedEvent = bitmovin.player.SubtitleRemovedEvent;

export class SubtitleSelectBox extends SelectBox {

    constructor(config: ListSelectorConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        // Add initial subtitles
        for(let subtitle of player.getAvailableSubtitles()) {
            self.addItem(subtitle.id, subtitle.label);
        }

        self.onItemSelected.subscribe(function(sender: SubtitleSelectBox, value: string) {
            player.setSubtitle(value == "null" ? null : value);
        });

        // React to API events
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_ADDED, function (event: SubtitleAddedEvent) {
            self.addItem(event.subtitle.id, event.subtitle.label);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGE, function (event: SubtitleChangedEvent) {
            self.selectItem(event.targetSubtitle.id);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_REMOVED, function (event: SubtitleRemovedEvent) {
            self.removeItem(event.subtitleId);
        });
    }
}
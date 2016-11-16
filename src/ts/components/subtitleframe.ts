import {Container, ContainerConfig} from "./container";
import {UIManager} from "../uimanager";
import SubtitleCueEvent = bitmovin.player.SubtitleCueEvent;
import {Label, LabelConfig} from "./label";

export class SubtitleFrame extends Container<ContainerConfig> {

    /**
     * Inner label that renders the subtitle text
     */
    private subtitleLabel: Label<LabelConfig>;

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.subtitleLabel = new Label<LabelConfig>({cssClass: 'ui-subtitle-label'});

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-subtitle-frame',
            components: [this.subtitleLabel]
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        this.subtitleLabel.configure(player, uimanager);

        let self = this;

        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_ENTER, function (event: SubtitleCueEvent) {
            self.subtitleLabel.setText(event.text);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_EXIT, function (event: SubtitleCueEvent) {
            self.subtitleLabel.setText("");
        });

        let subtitleClearHandler = function () {
            self.subtitleLabel.setText("");
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, subtitleClearHandler);
    }
}
import {ToggleButtonConfig} from "./togglebutton";
import {PlaybackToggleButton} from "./playbacktogglebutton";

export class HugePlaybackToggleButton extends PlaybackToggleButton {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-hugeplaybacktogglebutton',
            text: 'Play/Pause'
        });
    }

}
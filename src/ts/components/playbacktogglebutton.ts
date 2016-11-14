import {ToggleButton, ToggleButtonConfig} from "./togglebutton";

export class PlaybackToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-playbacktogglebutton',
            text: 'Play/Pause'
        }, this.config);
    }

}
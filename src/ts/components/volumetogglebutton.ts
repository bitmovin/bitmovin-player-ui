import {ToggleButton, ToggleButtonConfig} from "./togglebutton";

export class VolumeToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumetogglebutton',
            text: 'Volume/Mute'
        });
    }
}
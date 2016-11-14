import {ToggleButton, ToggleButtonConfig} from "./togglebutton";

export class VRToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-vrtogglebutton',
            text: 'VR'
        }, this.config);
    }

}
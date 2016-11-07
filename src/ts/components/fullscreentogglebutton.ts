import {ToggleButton, ToggleButtonConfig} from "./togglebutton";

export class FullscreenToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-fullscreentogglebutton',
            text: 'Fullscreen'
        });
    }
}
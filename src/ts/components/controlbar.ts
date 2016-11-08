import {ContainerConfig, Container} from "./container";

export interface ControlBarConfig extends ContainerConfig {
    /**
     * The delay after which the control bar will be hidden when there is no user interaction.
     * Default: 5 seconds
     */
    hideDelay?: number;
}

export class ControlBar extends Container<ControlBarConfig> {

    constructor(config: ControlBarConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-controlbar',
            hidden: true,
            hideDelay: 5000
        });
    }
}
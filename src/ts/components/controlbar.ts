import {ContainerConfig, Container} from "./container";

export interface ControlBarConfig extends ContainerConfig {
    // nothing to add
}

export class ControlBar extends Container<ControlBarConfig> {

    constructor(config: ControlBarConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-controlbar'
        });
    }
}
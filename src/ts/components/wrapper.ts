import {ContainerConfig, Container} from "./container";

export interface WrapperConfig extends ContainerConfig {
    // nothing to add
}

export class Wrapper extends Container<WrapperConfig> {

    constructor(config: WrapperConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-wrapper'
        });
    }
}
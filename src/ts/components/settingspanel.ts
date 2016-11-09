import {ContainerConfig, Container} from "./container";

export class SettingsPanel extends Container<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel'
        });
    }
}
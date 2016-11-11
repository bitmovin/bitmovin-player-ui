import {ContainerConfig, Container} from "./container";

export class SettingsPanel extends Container<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-settings-panel'
        });

        // We need to refresh the DOM element here, because it's already been created by the superclass
        // when setting the hidden state.
        // TODO find a nice solution for this cyclic dependency (config <-> config application <-> DOM element generation)
        this.refreshDomElement();

        // Update hidden state on refreshed DOM element
        if (this.isHidden()) {
            this.hide();
        }
    }
}
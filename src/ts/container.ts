import {ComponentConfig, Component} from "./component";
import {DOM} from "./dom";

export interface ContainerConfig extends ComponentConfig {
    /**
     * The HTML tag name of the container, 'div' by default.
     */
    tag?: string;

    /**
     * Child components of the container.
     */
    components?: Component<ComponentConfig>[];
}

export class Container<Config extends ContainerConfig> extends Component<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-container'
        });
    }

    addComponent(component: Component<ComponentConfig>) {
        this.config.components.push(component);
    }

    removeComponent(component: Component<ComponentConfig>) {
        ArrayUtils.remove(this.config.components, component);
    }

    toDomElement(): JQuery {
        var containerElement = DOM.JQuery(`<${this.config.tag}>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });

        for (let component of this.config.components) {
            containerElement.append(component.toDomElement());
        }

        return containerElement;
    }
}
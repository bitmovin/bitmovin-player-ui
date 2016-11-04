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
    components?: Component[];
}

export class Container extends Component {

    private config: ContainerConfig;

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-container'
        });
    }

    addComponent(component: Component) {
        this.config.components.push(component);
    }

    removeComponent(component: Component) {
        ArrayUtils.remove(this.config.components, component);
    }

    toDomElement(): JQuery {
        var containerElement = DOM.JQuery(`<${this.config.tag}>`, {
            id: this.config.id,
            class: this.config.cssClass
        });

        for (let component of this.config.components) {
            containerElement.append(component.toDomElement());
        }

        return containerElement;
    }
}
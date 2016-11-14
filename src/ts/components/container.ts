import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";
import {ArrayUtils} from "../utils";

export interface ContainerConfig extends ComponentConfig {
    /**
     * Child components of the container.
     */
    components?: Component<ComponentConfig>[];
}

export class Container<Config extends ContainerConfig> extends Component<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-container',
            components: []
        }, this.config);

        // Hide is config desires it. This can't be done in the base component because it requires the DOM element
        // which cannot be constructed until the constructor of the subclass has setup the config.
        if (this.isHidden()) {
            this.hide();
        }
    }

    /**
     * Adds a child component to the container.
     * @param component
     */
    addComponent(component: Component<ComponentConfig>) {
        this.config.components.push(component);
    }

    /**
     * Removes a child component from the container.
     * @param component
     */
    removeComponent(component: Component<ComponentConfig>) {
        ArrayUtils.remove(this.config.components, component);
    }

    /**
     * Gets an array of all child components in this container.
     * @returns {Component<ComponentConfig>[]}
     */
    getComponents() : Component<ComponentConfig>[] {
        return this.config.components;
    }

    protected toDomElement(): JQuery {
        var containerElement = DOM.JQuery(`<${this.config.tag}>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });

        var innerContainer = DOM.JQuery(`<${this.config.tag}>`, {
            'class': 'container'
        });

        for (let component of this.config.components) {
            innerContainer.append(component.getDomElement());
        }

        containerElement.append(innerContainer);

        return containerElement;
    }
}
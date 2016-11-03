import {ComponentConfig, Component} from "./component";
import {DOM} from "./dom";

export interface ContainerConfig extends ComponentConfig {
    components?: Component[];
}

export class Container extends Component {

    private config: ContainerConfig;

    constructor(config: ContainerConfig) {
        super(config);
        this.config = config;
    }

    addComponent(component: Component) {
        this.config.components.push(component);
    }

    removeComponent(component: Component) {
        ArrayUtils.remove(this.config.components, component);
    }

    toHtml(): string {
        var containerElement = DOM.JQuery(`<div id="${this.config.id}" class="${this.config.cssClass}">`);

        for (let component of this.config.components) {
            console.log('bbb');
            console.log(component);
            // TODO avoid component -> htmlstring -> jqueryobject -> htmlstring conversion
            containerElement.append(DOM.JQuery(component.toHtml()));
        }

        return containerElement.prop('outerHTML');
    }
}
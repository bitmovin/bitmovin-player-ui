import {ComponentConfig, Component} from "./component";

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
}
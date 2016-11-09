import {Component, ComponentConfig} from "./component";

export interface ListItemCollection {
    // value -> label mapping
    [value: string]: string;
}

export interface ListSelectorConfig extends ComponentConfig {
    items?: ListItemCollection;
}

export abstract class ListSelector<Config extends ListSelectorConfig> extends Component<ListSelectorConfig> {

    constructor(config: ListSelectorConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            items: {},
            cssClass: 'ui-listselector'
        });
    }
}
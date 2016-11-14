import {Component, ComponentConfig} from "./component";
import {EventDispatcher, Event} from "../eventdispatcher";

export interface ListItemCollection {
    // value -> label mapping
    [value: string]: string;
}

export interface ListSelectorConfig extends ComponentConfig {
    items?: ListItemCollection;
}

export abstract class ListSelector<Config extends ListSelectorConfig> extends Component<ListSelectorConfig> {

    protected items: ListItemCollection;
    protected selectedItem: string;

    protected listSelectorEvents = {
        onItemAdded: new EventDispatcher<ListSelector<Config>, string>(),
        onItemRemoved: new EventDispatcher<ListSelector<Config>, string>(),
        onItemSelected: new EventDispatcher<ListSelector<Config>, string>()
    };

    constructor(config: ListSelectorConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            items: {},
            cssClass: 'ui-listselector'
        }, this.config);

        this.items = this.config.items;
    }

    hasItem(value: string): boolean {
        return this.items[value] != null;
    }

    addItem(value: string, label: string) {
        this.items[value] = label;
        this.onItemAddedEvent(value);
    }

    removeItem(value: string): boolean {
        if(this.hasItem(value)) {
            delete this.items[value];
            this.onItemRemovedEvent(value);
            return true;
        }

        return false;
    }

    selectItem(value: string): boolean {
        if(value == this.selectedItem) {
            // item is already selected, suppress any further action
            return true;
        }

        if(this.items[value] != null) {
            this.selectedItem = value;
            this.onItemSelectedEvent(value);
            return true;
        }

        return false;
    }

    clearItems() {
        let items = this.items; // local copy for iteration after clear
        this.items = {}; // clear items

        // fire events
        for(let value in items) {
            this.onItemRemovedEvent(value);
        }
    }

    protected onItemAddedEvent(value: string) {
        this.listSelectorEvents.onItemAdded.dispatch(this, value);
    }

    protected onItemRemovedEvent(value: string) {
        this.listSelectorEvents.onItemRemoved.dispatch(this, value);
    }

    protected onItemSelectedEvent(value: string) {
        this.listSelectorEvents.onItemSelected.dispatch(this, value);
    }

    get onItemAdded(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemAdded;
    }

    get onItemRemoved(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemRemoved;
    }

    get onItemSelected(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemSelected;
    }
}
import {Component, ComponentConfig} from "./component";
import {EventDispatcher, Event} from "../eventdispatcher";
import {ArrayUtils} from "../utils";

/**
 * A map of items (key/value -> label} for a {@link ListSelector} in a {@link ListSelectorConfig}.
 */
export interface ListItem {
    key: string;
    label: string;
}

/**
 * Configuration interface for a {@link ListSelector}.
 */
export interface ListSelectorConfig extends ComponentConfig {
    items?: ListItem[];
}

export abstract class ListSelector<Config extends ListSelectorConfig> extends Component<ListSelectorConfig> {

    protected items: ListItem[];
    protected selectedItem: string;

    private listSelectorEvents = {
        onItemAdded: new EventDispatcher<ListSelector<Config>, string>(),
        onItemRemoved: new EventDispatcher<ListSelector<Config>, string>(),
        onItemSelected: new EventDispatcher<ListSelector<Config>, string>()
    };

    constructor(config: ListSelectorConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            items: [],
            cssClass: "ui-listselector"
        }, this.config);

        this.items = this.config.items;
    }

    private getItemIndex(key: string): number {
        for (let index in this.items) {
            if (key === this.items[index].key) {
                return parseInt(index);
            }
        }
        return -1;
    }

    /**
     * Checks if the specified item is part of this selector.
     * @param key the key of the item to check
     * @returns {boolean} true if the item is part of this selector, else false
     */
    hasItem(key: string): boolean {
        return this.getItemIndex(key) > -1;
    }

    /**
     * Adds an item to this selector by appending it to the end of the list of items.
     * @param key the key  of the item to add
     * @param label the (human-readable) label of the item to add
     */
    addItem(key: string, label: string) {
        this.items.push({key: key, label: label});
        this.onItemAddedEvent(key);
    }

    /**
     * Removes an item from this selector.
     * @param key the key of the item to remove
     * @returns {boolean} true if removal was successful, false if the item is not part of this selector
     */
    removeItem(key: string): boolean {
        let index = this.getItemIndex(key);
        if (index > -1) {
            ArrayUtils.remove(this.items, this.items[index]);
            this.onItemRemovedEvent(key);
            return true;
        }

        return false;
    }

    /**
     * Selects an item from the items in this selector.
     * @param key the key of the item to select
     * @returns {boolean} true is the selection was successful, false if the selected item is not part of the selector
     */
    selectItem(key: string): boolean {
        if (key === this.selectedItem) {
            // itemConfig is already selected, suppress any further action
            return true;
        }

        let index = this.getItemIndex(key);

        if (index > -1) {
            this.selectedItem = key;
            this.onItemSelectedEvent(key);
            return true;
        }

        return false;
    }

    /**
     * Returns the key of the selected item.
     * @returns {string} the key of the selected item or null if no item is selected
     */
    getSelectedItem(): string | null {
        return this.selectedItem;
    }

    /**
     * Removes all items from this selector.
     */
    clearItems() {
        let items = this.items; // local copy for iteration after clear
        this.items = []; // clear items

        // fire events
        for (let item of items) {
            this.onItemRemovedEvent(item.key);
        }
    }

    /**
     * Returns the number of items in this selector.
     * @returns {number}
     */
    itemCount(): number {
        return Object.keys(this.items).length;
    }

    protected onItemAddedEvent(key: string) {
        this.listSelectorEvents.onItemAdded.dispatch(this, key);
    }

    protected onItemRemovedEvent(key: string) {
        this.listSelectorEvents.onItemRemoved.dispatch(this, key);
    }

    protected onItemSelectedEvent(key: string) {
        this.listSelectorEvents.onItemSelected.dispatch(this, key);
    }

    /**
     * Gets the event that is fired when an item is added to the list of items.
     * @returns {Event<Sender, Args>}
     */
    get onItemAdded(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemAdded.getEvent();
    }

    /**
     * Gets the event that is fired when an item is removed from the list of items.
     * @returns {Event<Sender, Args>}
     */
    get onItemRemoved(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemRemoved.getEvent();
    }

    /**
     * Gets the event that is fired when an item is selected from the list of items.
     * @returns {Event<Sender, Args>}
     */
    get onItemSelected(): Event<ListSelector<Config>, string> {
        return this.listSelectorEvents.onItemSelected.getEvent();
    }
}
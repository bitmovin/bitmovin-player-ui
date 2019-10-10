import {Component, ComponentConfig} from './component';
import {EventDispatcher, Event} from '../eventdispatcher';
import {ArrayUtils} from '../arrayutils';
import { LocalizableText, getLocalizedText, i18n } from '../localization/i18n';

/**
 * A map of items (key/value -> label} for a {@link ListSelector} in a {@link ListSelectorConfig}.
 */
export interface ListItem {
  key: string;
  label: string;
}

/**
 * Filter function that can be used to filter out list items added through {@link ListSelector.addItem}.
 *
 * This is intended to be used in conjunction with subclasses that populate themselves automatically
 * via the player API, e.g. {@link SubtitleSelectBox}.
 */
export interface ListItemFilter {
  /**
   * Takes a list item and decides whether it should pass or be discarded.
   * @param {ListItem} listItem the item to apply the filter to
   * @returns {boolean} true to let the item pass through the filter, false to discard the item
   */
  (listItem: ListItem): boolean;
}

/**
 * Translator function to translate labels of list items added through {@link ListSelector.addItem}.
 *
 * This is intended to be used in conjunction with subclasses that populate themselves automatically
 * via the player API, e.g. {@link SubtitleSelectBox}.
 */
export interface ListItemLabelTranslator {
  /**
   * Takes a list item, optionally changes the label, and returns the new label.
   * @param {ListItem} listItem the item to translate
   * @returns {string} the translated or original label
   */
  (listItem: ListItem): string;
}

/**
 * Configuration interface for a {@link ListSelector}.
 */
export interface ListSelectorConfig extends ComponentConfig {
  items?: ListItem[];
  filter?: ListItemFilter;
  translator?: ListItemLabelTranslator;
}

export abstract class ListSelector<Config extends ListSelectorConfig> extends Component<ListSelectorConfig> {

  protected items: ListItem[];
  protected selectedItem: string;

  private listSelectorEvents = {
    onItemAdded: new EventDispatcher<ListSelector<Config>, string>(),
    onItemRemoved: new EventDispatcher<ListSelector<Config>, string>(),
    onItemSelected: new EventDispatcher<ListSelector<Config>, string>(),
  };

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      items: [],
      cssClass: 'ui-listselector',
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
   * Returns all current items of this selector.
   * * @returns {ListItem[]}
   */
  getItems(): ListItem[] {
    return this.items;
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
   * Adds an item to this selector by appending it to the end of the list of items. If an item with the specified
   * key already exists, it is replaced.
   * @param key the key of the item to add
   * @param label the (human-readable) label of the item to add
   */
  addItem(key: string, label: LocalizableText) {
    const listItem = { key: key, label: getLocalizedText(label)};

    // Apply filter function
    if (this.config.filter && !this.config.filter(listItem)) {
      return;
    }

    // Apply translator function
    if (this.config.translator) {
      listItem.label = this.config.translator(listItem);
    }

    // Try to remove key first to get overwrite behavior and avoid duplicate keys
    this.removeItem(key); // This will trigger an ItemRemoved and an ItemAdded event

    this.items.push(listItem);
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
   * Returns the items for the given key or undefined if no item with the given key exists.
   * @param key the key of the item to return
   * @returns {ListItem} the item with the requested key. Undefined if no item with the given key exists.
   */
  getItemForKey(key: string): ListItem {
    return this.items.find((item) => item.key === key);
  }

  /**
   * Synchronize the current items of this selector with the given ones. This will remove and add items selectively.
   * For each removed item the ItemRemovedEvent and for each added item the ItemAddedEvent will be triggered. Favour
   * this method over using clearItems and adding all items again afterwards.
   * @param newItems
   */
  synchronizeItems(newItems: ListItem[]): void {
    newItems
      .filter((item) => !this.hasItem(item.key))
      .forEach((item) => this.addItem(item.key, getLocalizedText(i18n.t(item.label))));

    this.items
      .filter((item) => newItems.filter((i) => i.key === item.key).length === 0)
      .forEach((item) => this.removeItem(item.key));
  }

  /**
   * Removes all items from this selector.
   */
  clearItems() {
    // local copy for iteration after clear
    let items = this.items;
    // clear items
    this.items = [];

    // clear the selection as the selected item is also removed
    this.selectedItem = null;

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
   * @returns {Event<ListSelector<Config>, string>}
   */
  get onItemAdded(): Event<ListSelector<Config>, string> {
    return this.listSelectorEvents.onItemAdded.getEvent();
  }

  /**
   * Gets the event that is fired when an item is removed from the list of items.
   * @returns {Event<ListSelector<Config>, string>}
   */
  get onItemRemoved(): Event<ListSelector<Config>, string> {
    return this.listSelectorEvents.onItemRemoved.getEvent();
  }

  /**
   * Gets the event that is fired when an item is selected from the list of items.
   * @returns {Event<ListSelector<Config>, string>}
   */
  get onItemSelected(): Event<ListSelector<Config>, string> {
    return this.listSelectorEvents.onItemSelected.getEvent();
  }
}
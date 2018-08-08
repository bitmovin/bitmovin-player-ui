import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import {ListSelector, ListSelectorConfig} from './listselector';
import {DOM} from '../dom';

/**
 * A element to select a single item out of a list of available items.
 *
 * DOM example:
 * <code>
 *   <div class='ui-listbox'>
 *     <button class='ui-listbox-button'>label</button>
 *     ...
 *   </div
 * </code>
 */
export class ListBox extends ListSelector<ListSelectorConfig> {
  private listBoxElement: DOM;

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listbox',
    } as ListSelectorConfig, this.config);
  }

  protected toDomElement(): DOM {
    let listBoxElement = new DOM('div', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    });

    this.listBoxElement = listBoxElement;
    this.updateDomItems();

    return listBoxElement;
  }

  protected updateDomItems(selectedValue: string = null) {
    // Delete all children
    this.listBoxElement.empty();

    // Add updated children
    for (let item of this.items) {
      let itemButton = new ListBoxItemButton({
        key: item.key,
        text: item.label,
      });

      itemButton.onClick.subscribe((sender) => {
        this.handleSelectionChange(<ListBoxItemButton>sender);
      });

      // These buttons are not in the component tree
      // see comment: https://github.com/bitmovin/bitmovin-player-ui/pull/122#discussion_r201958260
      const itemElement = itemButton.getDomElement();
      // convert selectedValue and item.key to string to catch 'null'/null case
      if (String(item.key) === String(selectedValue)) {
        itemButton.on();
      }

      this.listBoxElement.append(itemElement);
    }
  }

  private handleSelectionChange(sender: ListBoxItemButton) {
    this.onItemSelectedEvent(sender.key);
  }

  protected onItemAddedEvent(value: string) {
    super.onItemAddedEvent(value);
    this.updateDomItems(this.selectedItem);
  }

  protected onItemRemovedEvent(value: string) {
    super.onItemRemovedEvent(value);
    this.updateDomItems(this.selectedItem);
  }

  protected onItemSelectedEvent(value: string, updateDomItems: boolean = true) {
    super.onItemSelectedEvent(value);
    if (updateDomItems) {
      this.updateDomItems(value);
    }
  }
}

interface ListBoxItemButtonConfig extends ToggleButtonConfig {
  /**
   * key to identify selected item. Similar to the value attribute of an select option.
   */
  key: string;
}

class ListBoxItemButton extends ToggleButton<ListBoxItemButtonConfig> {

  constructor(config: ListBoxItemButtonConfig) {
    super(config);

    this.config = this.mergeConfig<ToggleButtonConfig>(config, {
      cssClass: 'ui-listbox-button',
      onClass: 'selected',
      offClass: '',
    }, this.config);
  }

  get key(): string {
    return (this.config as ListBoxItemButtonConfig).key;
  }
}

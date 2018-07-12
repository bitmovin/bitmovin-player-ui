import {Button, ButtonConfig} from './button';
import {ListSelector, ListSelectorConfig} from './listselector';
import {DOM} from '../dom';

/**
 * A element to select a single item out of a list of available items.
 *
 * DOM example:
 * <code>
 *   <div class='ui-listbox>
 *     <div class='ui-listboxitem-wrapper>
 *       <div class='ui-listboxitem'>
 *         <button class='ui-listboxitem-button'>label</button>
 *       </div>
 *     </div>
 *     ...
 *   </div
 * </code>
 */
export class ListBox extends ListSelector<ListSelectorConfig> {
  private listBoxElement: DOM;

  private static readonly SELECTED_LIST_BOX_ITEM_CLASS = 'ui-listboxitem-button-selected';

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

      const selectedItemClass = this.prefixCss(ListBox.SELECTED_LIST_BOX_ITEM_CLASS);
      // These buttons are not in the component tree
      // see comment: https://github.com/bitmovin/bitmovin-player-ui/pull/122#discussion_r201958260
      const itemElement = itemButton.getDomElement();
      // convert selectedValue and item.key to string to catch 'null'/null case
      if (String(item.key) === String(selectedValue)) {
        if (!itemElement.hasClass(selectedItemClass)) {
          itemElement.addClass(selectedItemClass);
        }
      }

      this.listBoxElement.append(itemElement);
    }
  }

  protected handleSelectionChange(sender: ListBoxItemButton) {
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

export interface ListBoxItemButtonConfig extends ButtonConfig {
  /**
   * key to identify selected item. Similar to the value attribute of an select option.
   */
  key: string;
}

export class ListBoxItemButton extends Button<ListBoxItemButtonConfig> {

  constructor(config: ListBoxItemButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listboxitem-button',
    }, this.config);
  }

  get key(): string {
    return (this.config as ListBoxItemButtonConfig).key;
  }
}

import {ListSelector, ListSelectorConfig} from './listselector';
import {DOM} from '../dom';
import { i18n } from '../localization/i18n';

export class ItemSelectionList extends ListSelector<ListSelectorConfig> {

  private static readonly CLASS_SELECTED = 'selected';

  private listElement: DOM;

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      tag: 'ul',
      cssClass: 'ui-itemselectionlist',
    }, this.config);
  }

  protected isActive(): boolean {
    return this.items.length > 1;
  }

  protected toDomElement(): DOM {
    let listElement = new DOM('ul', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    });

    this.listElement = listElement;
    this.updateDomItems();

    return listElement;
  }

  protected updateDomItems(selectedValue: string = null) {
    // Delete all children
    this.listElement.empty();

    let selectedListItem: DOM = null;

    const selectItem = (listItem: DOM) => {
      listItem.addClass(this.prefixCss(ItemSelectionList.CLASS_SELECTED));
    };

    const deselectItem = (listItem: DOM) => {
      listItem.removeClass(this.prefixCss(ItemSelectionList.CLASS_SELECTED));
    };

    for (let item of this.items) {
      let listItem = new DOM('li', {
        'type': 'li',
        'class': this.prefixCss('ui-selectionlistitem'),
      }).append(new DOM('a', {
      }).html(i18n.localize(item.label)));

      if (!selectedListItem) {
        if (selectedValue == null) { // If there is no pre-selected value, select the first one
          selectedListItem = listItem;
        } else if (String(selectedValue) === item.key) { // convert selectedValue to string to catch 'null'/null case
          selectedListItem = listItem;
        }
      }

      // Handle list item selections
      listItem.on('click', () => {
        // Deselect the previous item (if there was a selected item)
        if (selectedListItem) {
          deselectItem(selectedListItem);
        }

        // Select the clicked item
        selectedListItem = listItem;
        selectItem(listItem);

        // Fire the event
        this.onItemSelectedEvent(item.key, false);
      });

      // Select default item
      if (selectedListItem) {
        selectItem(selectedListItem);
      }

      this.listElement.append(listItem);
    }
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

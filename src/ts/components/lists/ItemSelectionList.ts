import { ListItem, ListSelector, ListSelectorConfig } from './ListSelector';
import { DOM } from '../../DOM';
import { i18n } from '../../localization/i18n';

/**
 * @category Components
 */
export class ItemSelectionList extends ListSelector<ListSelectorConfig> {
  private static readonly CLASS_SELECTED = 'selected';

  private listElement: DOM;
  /**
   * The rendered item labels and the items they show, so that they can be localized again in place.
   */
  private renderedItemLabels: { item: ListItem; element: DOM }[] = [];

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        tag: 'ul',
        cssClass: 'ui-itemselectionlist',
      },
      this.config,
    );
  }

  protected isActive(): boolean {
    return this.items.length > 1;
  }

  protected toDomElement(): DOM {
    const listElement = new DOM(
      'ul',
      {
        id: this.config.id,
        class: this.getCssClasses(),
      },
      this,
    );

    this.listElement = listElement;
    this.updateDomItems();

    return listElement;
  }

  protected updateDomItems(selectedValue: string = null) {
    // Delete all children
    this.listElement.empty();
    this.renderedItemLabels = [];

    let selectedListItem: DOM = null;

    const selectItem = (listItem: DOM) => {
      listItem.addClass(this.prefixCss(ItemSelectionList.CLASS_SELECTED));
    };

    const deselectItem = (listItem: DOM) => {
      listItem.removeClass(this.prefixCss(ItemSelectionList.CLASS_SELECTED));
    };

    for (const item of this.items) {
      const itemLabel = new DOM('a', {}).html(i18n.performLocalization(item.label));
      this.renderedItemLabels.push({ item, element: itemLabel });
      const listItem = new DOM('li', {
        type: 'li',
        class: this.prefixCss('ui-selectionlistitem'),
      }).append(itemLabel);

      if (!selectedListItem) {
        if (selectedValue == null) {
          // If there is no pre-selected value, select the first one
          selectedListItem = listItem;
        } else if (String(selectedValue) === item.key) {
          // convert selectedValue to string to catch 'null'/null case
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

  protected onLanguageChanged(): void {
    super.onLanguageChanged();

    // Localizes the item labels in place, because rebuilding the list would lose the selection the user made, which
    // is not necessarily the selected item yet
    for (const { item, element } of this.renderedItemLabels) {
      element.html(i18n.performLocalization(item.label));
    }
  }

  protected onItemsChangedEvent() {
    super.onItemsChangedEvent();
    this.updateDomItems(this.selectedItem);
  }

  protected onItemSelectedEvent(value: string, updateDomItems: boolean = true) {
    super.onItemSelectedEvent(value);
    if (updateDomItems) {
      this.updateDomItems(value);
    }
  }
}

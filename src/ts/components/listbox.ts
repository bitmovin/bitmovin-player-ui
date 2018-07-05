import {UIInstanceManager} from '../uimanager';
import {Button, ButtonConfig} from './button';
import {ListSelector, ListSelectorConfig} from './listselector';
import {DOM} from '../dom';
import {Timeout} from '../timeout';

export interface ListBoxConfig extends ListSelectorConfig {
  /**
   * The delay in milliseconds after which the settings panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;
  /**
   * Flag if the ListBox should disappear when an item got selected
   * Default: true
   */
  hideOnSelection?: boolean;
}

/**
 * A custom select box like element to select a single item out of a list of available items.
 * To have the `ListBoxToggleButton` and the `ListBox` bundled together in the UI
 * it should be included within an `ListBoxWrapper`.
 *
 * The trigger to open the `ListBox` is a `ListBoxToggleButton`.
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
export class ListBox extends ListSelector<ListBoxConfig> {
  private listBoxElement: DOM;
  private hideTimeout: Timeout;

  private static readonly SELECTED_LIST_BOX_ITEM_CLASS = 'ui-listboxitem-wrapper-selected';
  private static readonly LIST_BOX_ITEM_WRAPPER_CLASS = 'ui-listboxitem-wrapper';

  constructor(config: ListBoxConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-listbox',
      hideOnSelection: true,
      hideDelay: 3000,
    } as ListBoxConfig, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // TODO: extract timeout handling and combine with settingspanel.ts (extract also config interface)
    const hideDelay = (this.config as ListBoxConfig).hideDelay;
    if (hideDelay > -1) {
      this.hideTimeout = new Timeout(hideDelay, () => {
        this.hide();
      });

      this.onShow.subscribe(() => {
        // Activate timeout when shown
        this.hideTimeout.start();
      });
      this.getDomElement().on('mouseenter', () => {
        // On mouse enter clear the timeout
        this.hideTimeout.clear();
      });
      this.getDomElement().on('mouseleave', () => {
        // On mouse leave activate the timeout
        this.hideTimeout.reset();
      });
      this.onHide.subscribe(() => {
        // Clear timeout when hidden from outside
        this.hideTimeout.clear();
      });
    }
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
      let rowElement = new DOM('div', {
        'class': this.prefixCss(ListBox.LIST_BOX_ITEM_WRAPPER_CLASS),
      });
      let itemElement = new ListBoxItemButton({
        key: item.key,
        text: item.label,
      });
      itemElement.onClick.subscribe((sender) => {
        this.handleSelectionChange(<ListBoxItemButton>sender);
      });
      rowElement.append(itemElement.getDomElement());

      const selectedItemClass = this.prefixCss(ListBox.SELECTED_LIST_BOX_ITEM_CLASS);

      // convert selectedValue and item.key to string to catch 'null'/null case
      if (String(item.key) === String(selectedValue)) {
        if (!rowElement.hasClass(selectedItemClass)) {
          rowElement.addClass(selectedItemClass);
        }
      }

      this.listBoxElement.append(rowElement);
    }
  }

  protected handleSelectionChange(sender: ListBoxItemButton) {
    if ((this.getConfig() as ListBoxConfig).hideOnSelection)
      this.hide();
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

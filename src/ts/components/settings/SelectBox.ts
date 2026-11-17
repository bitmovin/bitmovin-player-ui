import { ListItem, ListSelector, ListSelectorConfig } from '../lists/ListSelector';
import { DOM } from '../../DOM';
import { i18n } from '../../localization/i18n';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { UIContainer } from '../UIContainer';
import { PlayerUtils } from '../../utils/PlayerUtils';
import { ViewMode } from '../Component';

const DocumentDropdownClosedEvents = [
  'mousemove',
  'mouseenter',
  'mouseleave',
  'touchstart',
  'touchmove',
  'touchend',
  'pointermove',
  'click',
  'keydown',
  'keypress',
  'keyup',
  'blur',
];

const SelectDropdownClosedEvents = ['change', 'keyup', 'mouseup'];

const DropdownOpenedEvents: [string, (event: Event) => boolean][] = [
  ['click', () => true],
  ['keydown', (event: KeyboardEvent) => [' ', 'ArrowUp', 'ArrowDown'].includes(event.key)],
  ['mousedown', () => true],
];

const Timeout = 100;

/**
 * A simple select box providing the possibility to select a single item out of a list of available items.
 *
 * DOM example:
 * <code>
 *     <select class='ui-selectbox'>
 *         <option value='key'>label</option>
 *         ...
 *     </select>
 * </code>
 *
 * @category Components
 */

export class SelectBox extends ListSelector<ListSelectorConfig> {
  private selectElement: DOM | undefined;
  /**
   * The rendered options and the items they show, so that their labels can be localized again in place.
   */
  private renderedOptions: { item: ListItem; element: DOM }[] = [];
  private dropdownCloseListenerTimeoutId = 0;
  private removeDropdownCloseListeners = () => {};
  private uiContainer: UIContainer | undefined;
  private removeDropdownOpenedListeners = () => {};
  private uiWrapperElement: DOM | undefined;

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-selectbox',
      },
      this.config,
    );
  }

  protected toDomElement(): DOM {
    this.selectElement = new DOM(
      'select',
      {
        id: this.config.id,
        class: this.getCssClasses(),
        'aria-label': this.localizeAriaLabel(this.config.ariaLabel),
      },
      this,
    );

    this.onDisabled.subscribe(this.closeDropdown);
    this.onHide.subscribe(this.closeDropdown);
    this.addDropdownOpenedListeners();
    this.updateDomItems();

    this.selectElement.on('change', this.onChange);

    return this.selectElement;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);
    this.uiContainer = uimanager.getUI();
    this.uiContainer?.onPlayerStateChange().subscribe(this.onPlayerStateChange);
    this.uiWrapperElement = uimanager.uiWrapperElement;
  }

  private readonly onChange = () => {
    const value = this.selectElement.val();
    this.onItemSelectedEvent(value, false);
  };

  private getSelectElement() {
    return this.selectElement?.get()?.[0];
  }

  protected updateDomItems(selectedValue: string = null) {
    if (this.selectElement === undefined) {
      return;
    }

    // Delete all children
    this.selectElement.empty();
    this.renderedOptions = [];

    // Add updated children
    for (const item of this.items) {
      const optionElement = new DOM('option', {
        value: String(item.key),
      }).html(i18n.performLocalization(item.label));
      this.renderedOptions.push({ item, element: optionElement });

      if (item.key === String(selectedValue)) {
        // convert selectedValue to string to catch 'null'/null case
        optionElement.attr('selected', 'selected');
      }

      this.selectElement.append(optionElement);
    }
  }

  protected onLanguageChanged(): void {
    super.onLanguageChanged();

    // Localizes the option labels in place, because rebuilding the options would lose the selection the user made,
    // which is not necessarily the selected item yet, and the focus
    for (const { item, element } of this.renderedOptions) {
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

  public readonly closeDropdown = () => {
    const select = this.getSelectElement();

    if (select === undefined) {
      return;
    }

    select.blur();
  };

  private readonly onPlayerStateChange = (_: UIContainer, state: PlayerUtils.PlayerState) => {
    if ([PlayerUtils.PlayerState.Idle, PlayerUtils.PlayerState.Finished].includes(state)) {
      this.closeDropdown();
    }
  };

  private onDropdownOpened = () => {
    clearTimeout(this.dropdownCloseListenerTimeoutId);

    this.dropdownCloseListenerTimeoutId = window.setTimeout(() => this.addDropdownCloseListeners(), Timeout);
    this.onViewModeChangedEvent(ViewMode.Persistent);
  };

  private onDropdownClosed = () => {
    clearTimeout(this.dropdownCloseListenerTimeoutId);

    this.removeDropdownCloseListeners();
    this.onViewModeChangedEvent(ViewMode.Temporary);
  };

  private addDropdownCloseListeners() {
    this.removeDropdownCloseListeners();

    clearTimeout(this.dropdownCloseListenerTimeoutId);

    DocumentDropdownClosedEvents.forEach(event => this.uiWrapperElement.on(event, this.onDropdownClosed, true));
    SelectDropdownClosedEvents.forEach(event => this.selectElement.on(event, this.onDropdownClosed, true));

    this.removeDropdownCloseListeners = () => {
      DocumentDropdownClosedEvents.forEach(event => this.uiWrapperElement.off(event, this.onDropdownClosed, true));
      SelectDropdownClosedEvents.forEach(event => this.selectElement.off(event, this.onDropdownClosed, true));
    };
  }

  private addDropdownOpenedListeners() {
    const removeListenerFunctions: (() => void)[] = [];

    this.removeDropdownOpenedListeners();

    for (const [event, filter] of DropdownOpenedEvents) {
      const listener = (event: Event) => {
        if (filter(event)) {
          this.onDropdownOpened();
        }
      };

      removeListenerFunctions.push(() => this.selectElement.off(event, listener, true));
      this.selectElement.on(event, listener, true);
    }

    this.removeDropdownOpenedListeners = () => {
      for (const remove of removeListenerFunctions) {
        remove();
      }
    };
  }

  release() {
    super.release();

    this.removeDropdownCloseListeners();
    this.removeDropdownOpenedListeners();
    clearTimeout(this.dropdownCloseListenerTimeoutId);
  }
}

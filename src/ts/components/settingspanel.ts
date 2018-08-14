import {ContainerConfig, Container} from './container';
import {ComponentConfig, Component} from './component';
import {SelectBox} from './selectbox';
import {Label} from './label';
import {UIInstanceManager} from '../uimanager';
import {VideoQualitySelectBox} from './videoqualityselectbox';
import {AudioQualitySelectBox} from './audioqualityselectbox';
import {Timeout} from '../timeout';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import {ListBox} from './listbox';
import {PlaybackSpeedSelectBox} from './playbackspeedselectbox';
import {SettingsPanelPage} from './settingspanelpage';

/**
 * Configuration interface for a {@link SettingsPanel}.
 */
export interface SettingsPanelConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the settings panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;

  /**
   * Flag to specify if there should be an animation when switching SettingsPanelPages.
   * Default: true
   */
  pageTransitionAnimation?: boolean;
}

/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
export class SettingsPanel extends Container<SettingsPanelConfig> {

  private static readonly ACTIVE_PAGE_CLASS = 'active';

  // navigation handling
  private activePageIndex = 0;
  private navigationStack: SettingsPanelPage[] = [];

  /**
   * Needed for backwards compatibility
   * @deprecated
   */
  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>(),
  };

  private hideTimeout: Timeout;

  constructor(config: SettingsPanelConfig) {
    super(config);

    // Add backwards compatibility
    // When all components are a type of SettingsPanelItem create a single SettingsPanelPage
    // and work with this newly created page
    const isTypeOfSettingsPanelItem = (currentValue: Component<ComponentConfig>) => {
      return currentValue instanceof SettingsPanelItem;
    };

    if (this.getComponents().every(isTypeOfSettingsPanelItem)) {
      let mainPage = new SettingsPanelPage({
        components: this.getComponents(),
      });
      this.config.components = [mainPage];
      config.components = this.config.components;
    }

    this.config = this.mergeConfig<SettingsPanelConfig>(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      pageTransitionAnimation: true,
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SettingsPanelConfig>this.getConfig(); // TODO fix generics type inference

    uimanager.onControlsHide.subscribe(() => this.hideHoveredSelectBoxes());

    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
        this.hideHoveredSelectBoxes();
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
        // Reset navigation
        this.resetNavigation();
      });
    }

    // pass event from root page through for backwards compatibility
    this.getRootPage().onSettingsStateChanged.subscribe(() => {
      this.onSettingsStateChangedEvent();
    });

    this.updateActivePageClass();
  }

  private updateActivePageClass(): void {
    this.getPages().forEach((page: SettingsPanelPage, index) => {
      if (index === this.activePageIndex) {
        page.getDomElement().addClass(SettingsPanel.ACTIVE_PAGE_CLASS);
      } else {
        page.getDomElement().removeClass(SettingsPanel.ACTIVE_PAGE_CLASS);
      }
    });
  }

  setActivePageIndex(index: number): void {
    const targetPage = this.getPages()[index];
    this.animateNavigation(targetPage);
    this.activePageIndex = index;
    this.navigationStack.push(targetPage);
    this.updateActivePageClass();
    targetPage.onActiveEvent();
  }

  setActivePage(page: SettingsPanelPage): void {
    const index = this.getPages().indexOf(page);
    this.setActivePageIndex(index);
  }

  // navigate to root page
  popToRootSettingsPanelPage(): void {
    this.resetNavigation();
  }

  popSettingsPanelPage() {
    // pop one navigation item from stack
    const currentPage = this.navigationStack.pop(); // remove current page
    const targetPage = this.navigationStack.slice(-1)[0];

    if (targetPage !== undefined) {
      this.setActivePage(targetPage);
    } else {
      // fallback to root
      this.popToRootSettingsPanelPage();
    }
    currentPage.onInactiveEvent();
  }

  private resetNavigation(): void {
    const currentPage = this.navigationStack.slice(-1)[0];
    if (currentPage) {
      currentPage.onInactiveEvent();
    }
    this.navigationStack = [];
    this.activePageIndex = 0;
    this.animateNavigation(this.getRootPage());
    this.updateActivePageClass();
  }

  private animateNavigation(targetPage: SettingsPanelPage) {
    if (!(this.config as SettingsPanelConfig).pageTransitionAnimation)
      return;
    // workaround to enable css transition for elements with auto width / height property
    // css transition does not work with auto properties by definition so we need to calculate 'real'
    // width / height values to have a nice looking animation

    const domElement = this.getDomElement();
    const htmlElement = domElement.get(0);
    // ensure container has real width / height (for first animation)
    if (htmlElement.style.width === '' || htmlElement.style.height === '') {
      domElement.css('width', domElement.css('width'));
      domElement.css('height', domElement.css('height'));
    }

    const targetPageHtmlElement = targetPage.getDomElement().get(0);
    const clone = targetPageHtmlElement.cloneNode(true) as HTMLElement;
    // append to parent so we get the 'real' size
    const containerWrapper = targetPageHtmlElement.parentNode;
    containerWrapper.appendChild(clone);
    // set clone visible
    clone.style.display = 'block';

    let widthOffset = 0;
    let heightOffset = 0;

    // getComputedStyle will return values like '100px' so we need to extract the number
    const getNumberOfCss = (value: String) => {
      return Number(value.replace(/[^\d\.\-]/g, ''));
    };

    // to calculate final width / height of container we need to include the padding / margin as well
    let elementsWithMargins: HTMLElement[] = [htmlElement, containerWrapper, targetPageHtmlElement] as HTMLElement[];
    for (let element of elementsWithMargins) {
      const computedStyles = getComputedStyle(element);
      // add padding
      widthOffset += getNumberOfCss(computedStyles.paddingLeft) + getNumberOfCss(computedStyles.paddingRight);
      heightOffset += getNumberOfCss(computedStyles.paddingTop) + getNumberOfCss(computedStyles.paddingBottom);
      // add margins
      widthOffset += getNumberOfCss(computedStyles.marginLeft) + getNumberOfCss(computedStyles.marginRight);
      heightOffset += getNumberOfCss(computedStyles.marginTop) + getNumberOfCss(computedStyles.marginBottom);
    }

    const width = clone.scrollWidth + widthOffset;
    const height = clone.scrollHeight + heightOffset;

    // remove clone from the DOM
    clone.remove();

    // set 'real' width / height
    domElement.css('width', width + 'px');
    domElement.css('height', height + 'px');
  }

  /**
   * Hack for IE + Firefox
   * when the settings panel fades out while an item of a select box is still hovered, the select box will not fade out
   * while the settings panel does. This would leave a floating select box, which is just weird
   */
  private hideHoveredSelectBoxes(): void {
    this.getComputedItems().forEach((item: SettingsPanelItem) => {
      if (item.isActive() && (item as any).setting instanceof SelectBox) {
        const selectBox = (item as any).setting as SelectBox;
        const oldDisplay = selectBox.getDomElement().css('display');
        // updating the display to none marks the select-box as inactive, so it will be hidden with the rest
        // we just have to make sure to reset this as soon as possible
        selectBox.getDomElement().css('display', 'none');
        if (window.requestAnimationFrame) {
          requestAnimationFrame(() => { selectBox.getDomElement().css('display', oldDisplay); });
        } else {
          // IE9 has no requestAnimationFrame, set the value directly. It has no optimization about ignoring DOM-changes
          // between animationFrames
          selectBox.getDomElement().css('display', oldDisplay);
        }
      }
    });
  }

  release(): void {
    super.release();
    if (this.hideTimeout) {
      this.hideTimeout.clear();
    }
  }

  /**
   * Checks if there are active settings within this settings panel. An active setting is a setting that is visible
   * and enabled, which the user can interact with.
   * @returns {boolean} true if there are active settings, false if the panel is functionally empty to a user
   */
  hasActiveSettings(): boolean {
    return this.getRootPage().hasActiveSettings();
  }

  getPages(): SettingsPanelPage[] {
    return <SettingsPanelPage[]>this.config.components.filter(component => component instanceof SettingsPanelPage);
  }

  // collect all items from all pages (see hideHoveredSelectBoxes)
  private getComputedItems(): SettingsPanelItem[] {
    const allItems: SettingsPanelItem[] = [];
    for (let page of this.getPages()) {
      allItems.push(...page.getItems());
    }
    return allItems;
  }

  private getRootPage(): SettingsPanelPage {
    return this.getPages()[0];
  }

  protected onSettingsStateChangedEvent() {
    this.settingsPanelEvents.onSettingsStateChanged.dispatch(this);
  }

  /**
   * Gets the event that is fired when one or more {@link SettingsPanelItem items} have changed state.
   * @deprecated
   * @returns {Event<SettingsPanel, NoArgs>}
   */
  get onSettingsStateChanged(): Event<SettingsPanel, NoArgs> {
    return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
  }

  addComponent(component: Component<ComponentConfig>) {
    if (component instanceof SettingsPanelPage) {
      super.addComponent(component);
    } else {
      // backwards compatibility
      this.getRootPage().addComponent(component);
    }
  }
}

/**
 * An item for a {@link SettingsPanel},
 * Containing an optionnal {@link Label} and a component that configures a setting.
 * If the components is a {@link SelectBox} it will handle the logic of displaying it or not
 */
export class SettingsPanelItem extends Container<ContainerConfig> {

  private label: Component<ComponentConfig>;
  private setting: Component<ComponentConfig>;

  private settingsPanelItemEvents = {
    onActiveChanged: new EventDispatcher<SettingsPanelItem, NoArgs>(),
  };

  constructor(label: string | Component<ComponentConfig>, setting: Component<ComponentConfig>, config: ContainerConfig = {}) {
    super(config);

    this.setting = setting;

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel-item',
    }, this.config);

    if (label !== null) {
      if (label instanceof Component) {
        this.label = label;
      } else {
        this.label = new Label({ text: label });
      }
      this.addComponent(this.label);
    }

    this.addComponent(this.setting);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    if (this.setting instanceof SelectBox || this.setting instanceof ListBox) {
      let handleConfigItemChanged = () => {
        if (!(this.setting instanceof SelectBox) && !(this.setting instanceof ListBox)) {
          return;
        }
        // The minimum number of items that must be available for the setting to be displayed
        // By default, at least two items must be available, else a selection is not possible
        let minItemsToDisplay = 2;
        // Audio/video quality select boxes contain an additional 'auto' mode, which in combination with a single
        // available quality also does not make sense
        if ((this.setting instanceof VideoQualitySelectBox && this.setting.hasAutoItem())
          || this.setting instanceof AudioQualitySelectBox) {
          minItemsToDisplay = 3;
        }

        if (this.setting.itemCount() < minItemsToDisplay) {
          // Hide the setting if no meaningful choice is available
          this.hide();
        } else if (this.setting instanceof PlaybackSpeedSelectBox
          && !uimanager.getConfig().playbackSpeedSelectionEnabled) {
          // Hide the PlaybackSpeedSelectBox if disabled in config
          this.hide();
        } else {
          this.show();
        }

        // Visibility might have changed and therefore the active state might have changed so we fire the event
        // TODO fire only when state has really changed (e.g. check if visibility has really changed)
        this.onActiveChangedEvent();
      };

      this.setting.onItemAdded.subscribe(handleConfigItemChanged);
      this.setting.onItemRemoved.subscribe(handleConfigItemChanged);

      // Initialize hidden state
      handleConfigItemChanged();
    }
  }

  /**
   * Checks if this settings panel item is active, i.e. visible and enabled and a user can interact with it.
   * @returns {boolean} true if the panel is active, else false
   */
  isActive(): boolean {
    return this.isShown();
  }

  protected onActiveChangedEvent() {
    this.settingsPanelItemEvents.onActiveChanged.dispatch(this);
  }

  /**
   * Gets the event that is fired when the 'active' state of this item changes.
   * @see #isActive
   * @returns {Event<SettingsPanelItem, NoArgs>}
   */
  get onActiveChanged(): Event<SettingsPanelItem, NoArgs> {
    return this.settingsPanelItemEvents.onActiveChanged.getEvent();
  }
}

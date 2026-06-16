import { Container, ContainerConfig } from '../Container';
import { SelectBox } from './SelectBox';
import { UIInstanceManager } from '../../UIManager';
import { Timeout } from '../../utils/Timeout';
import { Event, EventDispatcher, NoArgs } from '../../EventDispatcher';
import { SettingsPanelPage, SettingsPanelPageConfig } from './SettingsPanelPage';
import { SettingsPanelItem, SettingsPanelItemConfig } from './SettingsPanelItem';
import { PlayerAPI } from 'bitmovin-player';
import { Component, ComponentConfig } from '../Component';
import { getKeyMapForPlatform } from '../../spatialnavigation/getKeyMapForPlatform';
import { Action } from '../../spatialnavigation/types';

/**
 * Configuration interface for a {@link SettingsPanel}.
 *
 * @category Configs
 */
export interface SettingsPanelConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the settings panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 5 seconds (5000)
   */
  hideDelay?: number;

  /**
   * Flag to specify if there should be an animation when switching SettingsPanelPages.
   * Default: true
   */
  pageTransitionAnimation?: boolean;

  /**
   * The delay in milliseconds after hiding the settings panel before its internal state
   * (e.g., navigation stack and scroll position) is reset.
   * Set to -1 to disable automatic state reset.
   * Default: 5 seconds (5000)
   */
  stateResetDelay?: number;

  /**
   * Specifies if the settings panel should hide when the UI controls hide.
   * Default: true
   */
  hideOnControlsHide?: boolean;

  /**
   * Specifies if the settings panel should be hidden when another settings panel is opened.
   * Default: true
   */
  hideOnOtherSettingsPanelOpening?: boolean;
}

/**
 * State interface for preserving settings panel navigation and scroll position
 */
export interface SettingsPanelState {
  activePageIndex: number;
  navigationStackIndices: number[];
  scrollTop: number;
  wrapperScrollTop: number;
}

export enum NavigationDirection {
  Forwards,
  Backwards,
}

/**
 * A panel containing a list of {@link SettingsPanelPage items}.
 *
 * To configure pages just pass them in the components array.
 *
 * Example:
 *  let settingsPanel = new SettingsPanel({
 *    hidden: true,
 *  });
 *
 *  let settingsPanelPage = new SettingsPanelPage({
 *    components: […]
 *  });
 *
 *  let secondSettingsPanelPage = new SettingsPanelPage({
 *    components: […]
 *  });
 *
 *  settingsPanel.addComponent(settingsPanelPage);
 *  settingsPanel.addComponent(secondSettingsPanelPage);
 *
 * For an example how to navigate between pages @see SettingsPanelPageNavigatorButton
 *
 * @category Components
 */
export class SettingsPanel<Config extends SettingsPanelConfig> extends Container<Config> {
  private static readonly CLASS_ACTIVE_PAGE = 'active';

  // navigation handling
  private activePage: SettingsPanelPage;
  private navigationStack: SettingsPanelPage[] = [];

  private currentState: SettingsPanelState = null;

  private resetStateTimerId: number | null = null;
  private shouldResetStateImmediately: boolean = false;

  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel<SettingsPanelConfig>, NoArgs>(),
    onActivePageChanged: new EventDispatcher<SettingsPanel<SettingsPanelConfig>, NoArgs>(),
  };

  private hideTimeout: Timeout;

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settings-panel',
        hideDelay: 5000,
        pageTransitionAnimation: true,
        stateResetDelay: 5000,
        hideOnControlsHide: true,
        hideOnOtherSettingsPanelOpening: true,
      } as Config,
      this.config,
    );

    this.activePage = this.getRootPage();
    this.onActivePageChangedEvent();
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const config = this.getConfig();

    uimanager.onControlsHide.subscribe(() => this.hideHoveredSelectBoxes());
    uimanager.onComponentViewModeChanged.subscribe((_, { mode }) => this.trackComponentViewMode(mode));

    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
        this.hideHoveredSelectBoxes();
      });
      this.getDomElement().on('mouseenter mousemove', () => {
        this.hideTimeout.reset();
      });
      this.getDomElement().on('mouseleave', () => {
        // On mouse leave activate the timeout
        this.hideTimeout.reset();
      });
      this.getDomElement().on('focusin', () => {
        this.hideTimeout.clear();
      });
      this.getDomElement().on('focusout', () => {
        this.hideTimeout.reset();
      });
    }

    if (config.pageTransitionAnimation) {
      const handleResize = () => {
        // Reset the dimension of the settingsPanel to let the browser calculate the new dimension after resizing
        this.getDomElement().css({ width: '', height: '' });
      };

      player.on(player.exports.PlayerEvent.PlayerResized, handleResize);
    }

    const maybeCloseSettingsPanel = (event: KeyboardEvent) => {
      const action = getKeyMapForPlatform()[event.keyCode];
      if (action === Action.BACK) {
        this.hide();
        this.resetState();
      }
    };

    const scheduleResetState = () => {
      if (this.resetStateTimerId !== null) {
        clearTimeout(this.resetStateTimerId);
        this.resetStateTimerId = null;
      }

      if (config.stateResetDelay > -1) {
        this.resetStateTimerId = window.setTimeout(() => this.resetState(), config.stateResetDelay);
      }
    };

    this.onHide.subscribe(() => {
      if (this.shouldResetStateImmediately) {
        this.currentState = null;
        this.shouldResetStateImmediately = false;
      } else {
        this.currentState = this.maybeSaveCurrentState();
        scheduleResetState();
      }

      if (config.hideDelay > -1) {
        // Clear timeout when hidden from outside
        this.hideTimeout.clear();
      }

      // Since we don't reset the actual navigation here we need to simulate a onInactive event in case some panel
      // needs to do something when they become invisible / inactive.
      this.activePage.onInactiveEvent();

      document.removeEventListener('keyup', maybeCloseSettingsPanel);
    });

    this.onShow.subscribe(() => {
      if (this.resetStateTimerId !== null) {
        clearTimeout(this.resetStateTimerId);
        this.resetStateTimerId = null;
      }

      if (this.currentState !== null) {
        this.restoreNavigationState(this.currentState);
      } else {
        // No saved state (was reset), ensure visual classes are updated
        this.updateActivePageClass();
      }

      // Since we don't need to navigate to the root page again we need to fire the onActive event when the settings
      // panel gets visible.
      this.activePage.onActiveEvent();

      if (config.hideDelay > -1) {
        // Activate timeout when shown
        this.hideTimeout.start();
      }

      document.addEventListener('keyup', maybeCloseSettingsPanel);
    });

    // pass event from root page through
    this.getRootPage().onSettingsStateChanged.subscribe(() => {
      this.onSettingsStateChangedEvent();
    });

    if (config.hideOnControlsHide) {
      uimanager.onControlsHide.subscribe(() => {
        this.hide();
      });
    }
    uimanager.onControlsShow.subscribe(() => {
      if (this.currentState !== null) {
        this.show();
      }
    });

    this.updateActivePageClass();
  }

  /**
   * Returns the current active / visible page
   * @return {SettingsPanelPage}
   */
  getActivePage(): SettingsPanelPage {
    return this.activePage;
  }

  /**
   * Sets the
   * @deprecated Use {@link setActivePage} instead
   * @param index
   */
  setActivePageIndex(index: number): void {
    this.setActivePage(this.getPages()[index]);
  }

  /**
   * Adds the passed page to the navigation stack and makes it visible.
   * Use {@link popSettingsPanelPage} to navigate backwards.
   *
   * Results in no-op if the target page is the current page.
   * @param targetPage
   */
  setActivePage(targetPage: SettingsPanelPage): void {
    if (targetPage === this.getActivePage()) {
      console.warn('Page is already the current one ... skipping navigation');
      return;
    }

    this.navigateToPage(
      targetPage,
      this.getActivePage(),
      NavigationDirection.Forwards,
      !(this.config as SettingsPanelConfig).pageTransitionAnimation,
    );
  }

  /**
   * Resets the navigation stack by navigating back to the root page and displaying it.
   */
  popToRootSettingsPanelPage(): void {
    this.resetNavigation((this.config as SettingsPanelConfig).pageTransitionAnimation);
  }

  /**
   * Removes the current page from the navigation stack and makes the previous one visible.
   * Results in a no-op if we are already on the root page.
   */
  popSettingsPanelPage() {
    if (this.navigationStack.length === 0) {
      console.warn('Already on the root page ... skipping navigation');
      return;
    }

    let targetPage = this.navigationStack[this.navigationStack.length - 2];
    // The root part isn't part of the navigation stack so handle it explicitly here
    if (!targetPage) {
      targetPage = this.getRootPage();
    }

    const currentActivePage = this.activePage;
    this.navigateToPage(
      targetPage,
      this.activePage,
      NavigationDirection.Backwards,
      !(this.config as SettingsPanelConfig).pageTransitionAnimation,
    );

    if (currentActivePage.getConfig().removeOnPop) {
      this.removeComponent(currentActivePage);
      this.updateComponents();
    }
  }

  /**
   * Checks if there are active settings within the root page of the settings panel.
   * An active setting is a setting that is visible and enabled, which the user can interact with.
   * @returns {boolean} true if there are active settings, false if the panel is functionally empty to a user
   */
  rootPageHasActiveSettings(): boolean {
    return this.getRootPage().hasActiveSettings();
  }

  /**
   * Return all configured pages
   * @returns {SettingsPanelPage[]}
   */
  getPages(): SettingsPanelPage[] {
    return <SettingsPanelPage[]>this.config.components.filter(component => component instanceof SettingsPanelPage);
  }

  /**
   * Returns the root page of the settings panel.
   * @returns {SettingsPanelPage}
   */
  getRootPage(): SettingsPanelPage {
    return this.getPages()[0];
  }

  get onSettingsStateChanged(): Event<SettingsPanel<SettingsPanelConfig>, NoArgs> {
    return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
  }

  get onActivePageChanged(): Event<SettingsPanel<SettingsPanelConfig>, NoArgs> {
    return this.settingsPanelEvents.onActivePageChanged.getEvent();
  }

  hideAndReset(): void {
    this.shouldResetStateImmediately = true;
    this.hide();
    this.resetState();
  }

  release(): void {
    super.release();
    if (this.hideTimeout) {
      this.hideTimeout.clear();
    }
  }

  // Support adding settingsPanelPages after initialization
  addComponent(component: Component<ComponentConfig>) {
    if (this.getPages().length === 0 && component instanceof SettingsPanelPage) {
      this.activePage = component;
      this.onActivePageChangedEvent();
    }
    super.addComponent(component);
  }

  addPage(page: SettingsPanelPage) {
    this.addComponent(page);
    this.updateComponents();
  }

  protected suspendHideTimeout() {
    this.hideTimeout.suspend();
  }

  protected resumeHideTimeout() {
    this.hideTimeout.resume(true);
  }

  private updateActivePageClass(): void {
    this.getPages().forEach((page: SettingsPanelPage) => {
      if (page === this.activePage) {
        page.getDomElement().addClass(this.prefixCss(SettingsPanel.CLASS_ACTIVE_PAGE));
      } else {
        page.getDomElement().removeClass(this.prefixCss(SettingsPanel.CLASS_ACTIVE_PAGE));
      }
    });
  }

  private resetNavigation(resetNavigationOnShow: boolean): void {
    const sourcePage = this.getActivePage();
    const rootPage = this.getRootPage();
    if (sourcePage) {
      // Since the onInactiveEvent was already fired in the onHide we need to suppress it here
      if (!resetNavigationOnShow) {
        sourcePage.onInactiveEvent();
      }
    }
    this.navigationStack = [];
    this.animateNavigation(rootPage, sourcePage, resetNavigationOnShow);
    this.activePage = rootPage;
    this.updateActivePageClass();
    this.onActivePageChangedEvent();
  }

  private get wrapperScrollTop(): number {
    return this.innerContainerElement.get(0)?.scrollTop ?? 0;
  }

  private set wrapperScrollTop(value: number) {
    const element = this.innerContainerElement.get(0);
    if (element) {
      element.scrollTop = value;
    }
  }

  private resetState(): void {
    this.activePage = this.getRootPage();
    this.navigationStack = [];
    this.currentState = null;
    this.resetStateTimerId = null;

    if (this.isHidden()) {
      // Clear dimensions only when hidden to avoid visible transition animation
      this.getDomElement().css({ width: '', height: '' });
    }
  }

  private buildCurrentState(): SettingsPanelState {
    const pages = this.getPages();
    const activePageIndex = pages.indexOf(this.getActivePage());
    const navigationStackIndices = this.navigationStack.map(p => pages.indexOf(p));

    const panelElement = this.getDomElement().get(0);

    return {
      activePageIndex,
      navigationStackIndices,
      scrollTop: panelElement.scrollTop,
      wrapperScrollTop: this.wrapperScrollTop,
    };
  }

  private isDefaultPanelState(): boolean {
    const panelElement = this.getDomElement().get(0);
    const atRoot = this.getActivePage() === this.getRootPage();
    const noNav = this.navigationStack.length === 0;
    const noScroll = (panelElement?.scrollTop ?? 0) === 0 && this.wrapperScrollTop === 0;

    return atRoot && noNav && noScroll;
  }

  private maybeSaveCurrentState(): SettingsPanelState | null {
    return this.isDefaultPanelState() ? null : this.buildCurrentState();
  }

  private restoreNavigationState(state: SettingsPanelState): void {
    const pages = this.getPages();

    this.activePage = pages[state.activePageIndex] ?? this.getRootPage();
    this.navigationStack = state.navigationStackIndices.map(i => pages[i]).filter(Boolean);

    this.updateActivePageClass();
    this.onActivePageChangedEvent();
    this.activePage.onActiveEvent();

    this.getDomElement().get(0).scrollTop = state.scrollTop;
    this.wrapperScrollTop = state.wrapperScrollTop;
  }

  protected navigateToPage(
    targetPage: SettingsPanelPage,
    sourcePage: SettingsPanelPage,
    direction: NavigationDirection,
    skipAnimation: boolean,
  ): void {
    this.activePage = targetPage;

    if (direction === NavigationDirection.Forwards) {
      this.navigationStack.push(targetPage);
    } else {
      this.navigationStack.pop();
    }

    this.animateNavigation(targetPage, sourcePage, skipAnimation);

    this.updateActivePageClass();
    sourcePage.onInactiveEvent();
    targetPage.onActiveEvent();

    this.onActivePageChangedEvent();
  }

  /**
   * @param targetPage
   * @param sourcePage
   * @param skipAnimation This is just an internal flag if we want to have an animation. It is set true when we reset
   * the navigation within the onShow callback of the settingsPanel. In this case we don't want an actual animation but
   * the recalculation of the dimension of the settingsPanel.
   * This is independent of the pageTransitionAnimation flag.
   */
  private animateNavigation(targetPage: SettingsPanelPage, sourcePage: SettingsPanelPage, skipAnimation: boolean) {
    if (!(this.config as SettingsPanelConfig).pageTransitionAnimation) {
      return;
    }

    const settingsPanelDomElement = this.getDomElement();
    const settingsPanelHTMLElement = this.getDomElement().get(0);

    // get current dimension
    const settingsPanelWidth = settingsPanelHTMLElement.scrollWidth;
    const settingsPanelHeight = settingsPanelHTMLElement.scrollHeight;

    // calculate target size of the settings panel
    sourcePage.getDomElement().css('display', 'none');
    this.getDomElement().css({ width: '', height: '' }); // let css auto settings kick in again

    const targetPageHtmlElement = targetPage.getDomElement().get(0);
    // clone the targetPage DOM element so that we can calculate the width / height how they will be after
    // switching the page. We are using a clone to prevent (mostly styling) side-effects on the real DOM element
    const clone = targetPageHtmlElement.cloneNode(true) as HTMLElement;
    // append to parent so we get the 'real' size
    const containerWrapper = targetPageHtmlElement.parentNode;
    containerWrapper.appendChild(clone);
    // set clone visible
    clone.style.display = 'block';

    // collect target dimension
    const targetSettingsPanelWidth = settingsPanelHTMLElement.scrollWidth;
    const targetSettingsPanelHeight = settingsPanelHTMLElement.scrollHeight;

    // remove clone from the DOM
    clone.parentElement.removeChild(clone); // .remove() is not working in IE
    sourcePage.getDomElement().css('display', '');

    // set the values back to the current ones that the browser animates it (browsers don't animate 'auto' values)
    settingsPanelDomElement.css({
      width: settingsPanelWidth + 'px',
      height: settingsPanelHeight + 'px',
    });

    if (!skipAnimation) {
      // We need to force the browser to reflow between setting the width and height that we actually get a animation
      this.forceBrowserReflow();
    }

    // set the values to the target dimension
    settingsPanelDomElement.css({
      width: targetSettingsPanelWidth + 'px',
      height: targetSettingsPanelHeight + 'px',
    });
  }

  private forceBrowserReflow(): void {
    // Force the browser to reflow the layout
    // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.getDomElement().get(0).offsetLeft;
  }

  /**
   * Workaround for IE, Firefox and Safari
   * when the settings panel fades out while an item of a select box is still hovered, the select box will not fade out
   * while the settings panel does. This would leave a floating select box, which is just weird
   */
  private hideHoveredSelectBoxes(): void {
    this.getComputedItems()
      .map(item => item['settingComponent'])
      .filter(component => component instanceof SelectBox)
      .forEach((selectBox: SelectBox) => selectBox.closeDropdown());
  }

  // collect all items from all pages (see hideHoveredSelectBoxes)
  private getComputedItems(): SettingsPanelItem<SettingsPanelItemConfig>[] {
    const allItems: SettingsPanelItem<SettingsPanelItemConfig>[] = [];
    for (const page of this.getPages()) {
      allItems.push(...page.getItems());
    }
    return allItems;
  }

  protected onSettingsStateChangedEvent() {
    this.settingsPanelEvents.onSettingsStateChanged.dispatch(this);
  }

  protected onActivePageChangedEvent() {
    this.settingsPanelEvents.onActivePageChanged.dispatch(this);
  }
}

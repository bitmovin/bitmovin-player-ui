import { Container, ContainerConfig } from './container';
import { SelectBox } from './selectbox';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { Event, EventDispatcher, NoArgs } from '../eventdispatcher';
import { SettingsPanelPage } from './settingspanelpage';
import { SettingsPanelItem } from './settingspanelitem';
import { PlayerAPI } from 'bitmovin-player';
import { Component, ComponentConfig } from './component';

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

enum NavigationDirection {
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
 */
export class SettingsPanel extends Container<SettingsPanelConfig> {

  private static readonly CLASS_ACTIVE_PAGE = 'active';

  // navigation handling
  private activePage: SettingsPanelPage;
  private navigationStack: SettingsPanelPage[] = [];

  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>(),
  };

  private hideTimeout: Timeout;

  constructor(config: SettingsPanelConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      pageTransitionAnimation: true,
    } as SettingsPanelConfig, this.config);

    this.activePage = this.getRootPage();
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    uimanager.onControlsHide.subscribe(() => this.hideHoveredSelectBoxes());

    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
        this.hideHoveredSelectBoxes();
      });

      this.onShow.subscribe(() => {
        // Reset navigation when te panel gets visible to avoid a weird animation when hiding
        this.resetNavigation(true);
        // Since we don't need to navigate to the root page again we need to fire the onActive event when the settings
        // panel gets visible.
        this.activePage.onActiveEvent();
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
        // Since we don't reset the actual navigation here we need to simulate a onInactive event in case some panel
        // needs to do something when they become invisible / inactive.
        this.activePage.onInactiveEvent();
      });
    }

    // pass event from root page through
    this.getRootPage().onSettingsStateChanged.subscribe(() => {
      this.onSettingsStateChangedEvent();
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
   * @params page
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

    this.navigateToPage(
      targetPage,
      this.activePage,
      NavigationDirection.Backwards,
      !(this.config as SettingsPanelConfig).pageTransitionAnimation,
    );
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

  get onSettingsStateChanged(): Event<SettingsPanel, NoArgs> {
    return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
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
    }
    super.addComponent(component);
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
  }

  private navigateToPage(
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
    targetPage.onActiveEvent();
    sourcePage.onInactiveEvent();
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
    this.getDomElement().get(0).offsetLeft;
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
          requestAnimationFrame(() => {
            selectBox.getDomElement().css('display', oldDisplay);
          });
        } else {
          // IE9 has no requestAnimationFrame, set the value directly. It has no optimization about ignoring DOM-changes
          // between animationFrames
          selectBox.getDomElement().css('display', oldDisplay);
        }
      }
    });
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
}

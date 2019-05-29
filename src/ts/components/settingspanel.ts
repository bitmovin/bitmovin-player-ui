import { Container, ContainerConfig } from './container';
import { SelectBox } from './selectbox';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { Event, EventDispatcher, NoArgs } from '../eventdispatcher';
import { SettingsPanelPage } from './settingspanelpage';
import { SettingsPanelItem } from './settingspanelitem';
import { PlayerAPI } from 'bitmovin-player';

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
 * A panel containing a list of {@link SettingsPanelPage items}.
 */
export class SettingsPanel extends Container<SettingsPanelConfig> {

  private static readonly CLASS_ACTIVE_PAGE = 'active';

  // navigation handling
  private activePageIndex = 0;
  private navigationStack: SettingsPanelPage[] = [];

  private settingsPanelEvents = {
    onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>(),
  };

  private hideTimeout: Timeout;

  constructor(config: SettingsPanelConfig) {
    super(config);

    this.config = this.mergeConfig<SettingsPanelConfig>(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      pageTransitionAnimation: true,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
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

    // pass event from root page through
    this.getRootPage().onSettingsStateChanged.subscribe(() => {
      this.onSettingsStateChangedEvent();
    });

    this.updateActivePageClass();
  }

  private updateActivePageClass(): void {
    this.getPages().forEach((page: SettingsPanelPage, index) => {
      if (index === this.activePageIndex) {
        page.getDomElement().addClass(this.prefixCss(SettingsPanel.CLASS_ACTIVE_PAGE));
      } else {
        page.getDomElement().removeClass(this.prefixCss(SettingsPanel.CLASS_ACTIVE_PAGE));
      }
    });
  }

  getActivePage(): SettingsPanelPage {
    return this.getPages()[this.activePageIndex];
  }

  setActivePageIndex(index: number): void {
    const targetPage = this.getPages()[index];
    if (targetPage) {
      this.animateNavigation(targetPage, this.getActivePage());
      this.activePageIndex = index;

      // When we are navigating back, the current page (from which we navigate away) was already removed from the
      // navigationStack (in #popSettingsPanelPage). That means that the target page now is the last
      // one in the navigationStack too. In this case we must not add it to the navigationStack again,
      // otherwise we are trapped within the penultimate page.
      if (this.navigationStack[this.navigationStack.length - 1] !== targetPage) {
        this.navigationStack.push(targetPage);
      }

      this.updateActivePageClass();
      targetPage.onActiveEvent();
    }
  }

  setActivePage(page: SettingsPanelPage): void {
    const index = this.getPages().indexOf(page);
    this.setActivePageIndex(index);
  }

  popToRootSettingsPanelPage(): void {
    this.resetNavigation();
  }

  popSettingsPanelPage() {
    // pop one navigation item from stack
    const currentPage = this.navigationStack.pop(); // remove current page
    const targetPage = this.navigationStack[this.navigationStack.length - 1]; // pick target page without removing it

    if (targetPage) {
      this.setActivePage(targetPage);
    } else {
      // fallback to root
      this.popToRootSettingsPanelPage();
    }
    currentPage.onInactiveEvent();
  }

  private resetNavigation(): void {
    const currentPage = this.navigationStack[this.navigationStack.length - 1];
    if (currentPage) {
      currentPage.onInactiveEvent();
    }
    this.navigationStack = [];
    this.animateNavigation(this.getRootPage(), this.getActivePage());
    this.activePageIndex = 0;
    this.updateActivePageClass();
  }

  // TODO: pass current page too. (Don't fetch it cause the currentIndex could be wrong already; Fix Side-effect)
  // TODO: find out if we can write a test for this
  private animateNavigation(targetPage: SettingsPanelPage, sourcePage: SettingsPanelPage) {
    if (!(this.config as SettingsPanelConfig).pageTransitionAnimation) {
      return;
    }

    const settingsPanelDomElement = this.getDomElement();
    const settingsPanelHTMLElement = this.getDomElement().get(0);

    const settingsPanelWidth = settingsPanelHTMLElement.scrollWidth;
    const settingsPanelHeight = settingsPanelHTMLElement.scrollHeight;

    // Calculate target size of the settings panel
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

    const targetSettingsPanelWidth = settingsPanelHTMLElement.scrollWidth;
    const targetSettingsPanelHeight = settingsPanelHTMLElement.scrollHeight;

    // remove clone from the DOM
    clone.parentElement.removeChild(clone); // .remove() is not working in IE
    sourcePage.getDomElement().css('display', '');

    settingsPanelDomElement.css({
      width: settingsPanelWidth + 'px',
      height: settingsPanelHeight + 'px',
    });

    // We need to force the browser to reflow between setting the width and height that we actually get a animation
    this.forceBrowserReflow();

    // TODO: back navigation doesn't look perfect cause children doesn't animate nicely
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

  release(): void {
    super.release();
    if (this.hideTimeout) {
      this.hideTimeout.clear();
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

  get onSettingsStateChanged(): Event<SettingsPanel, NoArgs> {
    return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
  }
}

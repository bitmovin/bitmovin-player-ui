import {Container, ContainerConfig} from './container';
import {SelectBox} from './selectbox';
import {UIInstanceManager} from '../uimanager';
import {Timeout} from '../timeout';
import {Event, EventDispatcher, NoArgs} from '../eventdispatcher';
import {SettingsPanelPage} from './settingspanelpage';
import {SettingsPanelItem} from './settingspanelitem';
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

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      pageTransitionAnimation: true,
    } as SettingsPanelConfig, this.config);
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

  setActivePageIndex(index: number): void {
    const targetPage = this.getPages()[index];
    if (targetPage) {
      this.animateNavigation(targetPage);
      this.activePageIndex = index;
      this.navigationStack.push(targetPage);
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
      domElement.css({
        'width': domElement.css('width'),
        'height': domElement.css('height'),
      });
    }

    const targetPageHtmlElement = targetPage.getDomElement().get(0);
    // clone the targetPage DOM element so that we can calculate the width / height how they will be after
    // switching the page. We are using a clone to prevent (mostly styling) side-effects on the real DOM element
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
    clone.parentElement.removeChild(clone); // .remove() is not working in IE

    // set 'real' width / height
    domElement.css({
      'width': width + 'px',
      'height': height + 'px',
    });
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

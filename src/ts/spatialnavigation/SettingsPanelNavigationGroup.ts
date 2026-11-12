import { NavigationGroup } from './NavigationGroup';
import { Action, Focusable } from './types';
import { isComponent } from './TypeGuards';
import { SettingsPanel, SettingsPanelConfig } from '../components/settings/SettingsPanel';
import { resolveAllComponents } from './helper/resolveAllComponents';
import { InteractiveSettingsPanelItem } from '../components/settings/InteractiveSettingsPanelItem';
import { NodeEventSubscriber } from './NodeEventSubscriber';
import { toHtmlElement } from './helper/toHtmlElement';

export class SettingsPanelNavigationGroupConfig {
  /**
   * If true, the SettingsPanel will close when an item is selected.
   * Default: true.
   */
  closeOnSelect?: boolean;
}

/**
 * Extend NavigationGroup to provide additional logic for navigating within a SettingsPanel.
 *
 * @category Components
 */
export class SettingsPanelNavigationGroup extends NavigationGroup {
  private readonly settingsPanel: SettingsPanel<SettingsPanelConfig>;
  private readonly config: SettingsPanelNavigationGroupConfig;
  private readonly panelEventSubscriber = new NodeEventSubscriber();
  private isTrackingPanelFocus = false;

  constructor(
    settingsPanel: SettingsPanel<SettingsPanelConfig>,
    config: SettingsPanelNavigationGroupConfig | undefined = undefined,
  ) {
    const settingsPanelPage = settingsPanel.getRootPage();
    const components = settingsPanelPage.getItems();

    super(settingsPanel, ...components);
    this.settingsPanel = settingsPanel;
    this.config = Object.assign(
      {},
      this.config,
      {
        closeOnSelect: true,
      },
      config,
    );

    // The SettingsPanel is created and updated dynamically. To keep the navigation working between pages,
    // we need to listen to page changes and reset the active component form the previous page and focus on
    // the first component of the new page.
    settingsPanel.onActivePageChanged.subscribe(() => {
      this.activeComponent = undefined;
      this.focusFirstComponent();
    });
  }

  override enable(): void {
    if (!this.isTrackingPanelFocus) {
      this.isTrackingPanelFocus = true;
      this.panelEventSubscriber.on(toHtmlElement(this.settingsPanel), 'focusin', this.onPanelFocusIn);
    }

    super.enable();
  }

  override release(): void {
    this.panelEventSubscriber.release();
    this.isTrackingPanelFocus = false;
    super.release();
  }

  // The SettingsPanel moves focus on its own, e.g. back to the item that opened a sub-page when navigating back.
  // Continue navigating from there instead of from the previously active component.
  private readonly onPanelFocusIn = (event: FocusEvent): void => {
    if (!this.activeComponent) {
      return;
    }

    const focusedComponent = this.getComponents()
      .filter(isComponent)
      .find(component => toHtmlElement(component) === event.target);
    if (focusedComponent && focusedComponent !== this.activeComponent) {
      this.activeComponent = focusedComponent;
    }
  };

  // Dynamically resolve all components from the SettingsPanels active page. The SettingsPanel is crated dynamically and
  // during navigating between pages. To keep the navigation working, we need to resolve all components lazy.
  override getComponents(): Focusable[] {
    const activeSettingsPanelPage = this.settingsPanel.getActivePage();
    const pageComponents = activeSettingsPanelPage.getItems();

    const componentsToConsider: Focusable[] = [];
    pageComponents.forEach(component => {
      if (component instanceof InteractiveSettingsPanelItem) {
        componentsToConsider.push(component);
      } else {
        componentsToConsider.push(...resolveAllComponents(component));
      }
    });

    return componentsToConsider;
  }

  protected defaultActionHandler(action: Action): boolean {
    if (action === Action.BACK) {
      this.settingsPanel.popSettingsPanelPage();
      return true;
    }

    if (action === Action.SELECT) {
      // Ensure that the click event is triggered on the focused component before handling the navigation.
      super.defaultActionHandler(action);

      if (this.config.closeOnSelect) {
        this.settingsPanel.hide();
        super.defaultActionHandler(Action.BACK);
      }
      return true;
    }

    return super.defaultActionHandler(action);
  }
}

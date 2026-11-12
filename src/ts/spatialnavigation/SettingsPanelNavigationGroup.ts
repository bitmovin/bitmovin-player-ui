import { NavigationGroup } from './NavigationGroup';
import { Action, Focusable } from './types';
import { SettingsPanel, SettingsPanelConfig } from '../components/settings/SettingsPanel';
import { resolveAllComponents } from './helper/resolveAllComponents';
import { InteractiveSettingsPanelItem } from '../components/settings/InteractiveSettingsPanelItem';
import { NodeEventSubscriber } from './NodeEventSubscriber';

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
  private readonly keyEventSubscriber = new NodeEventSubscriber();

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

    this.keyEventSubscriber.on(document, 'keydown', this.handleHomeEndKey, true);
  }

  /**
   * Handles Home and End, which the settings panel otherwise handles on its own, so that the item focused through
   * them is also the one this group navigates from and activates. The key maps of spatial navigation do not map
   * these keys.
   */
  private handleHomeEndKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Home' && event.key !== 'End') {
      return;
    }

    // Only while this group owns the focus, i.e. the panel is shown and no other group is active
    if (!this.getActiveComponent() || this.settingsPanel.isHidden()) {
      return;
    }

    const components = this.getComponents();
    if (components.length === 0) {
      return;
    }

    this.focusComponent(event.key === 'Home' ? components[0] : components[components.length - 1]);
    event.preventDefault();
    event.stopPropagation();
  };

  override release(): void {
    this.keyEventSubscriber.release();
    super.release();
  }

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

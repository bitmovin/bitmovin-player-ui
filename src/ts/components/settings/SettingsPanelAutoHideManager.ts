import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { SettingsPanelPage } from './SettingsPanelPage';
import { ArrayUtils } from '../../utils/ArrayUtils';
import { Timeout } from '../../utils/Timeout';

/**
 * State interface for preserving settings panel navigation and scroll position
 */
export interface SettingsPanelState {
  activePage: SettingsPanelPage;
  navigationStack: SettingsPanelPage[];
  scrollTop: number;
  wrapperScrollTop: number;
  panelWidth: number;
  panelHeight: number;
}

/**
 * Configuration interface for {@link SettingsPanelAutoHideManager}
 */
export interface SettingsPanelAutoHideManagerConfig {
  /**
   * The delay in milliseconds after which saved settings panel state will be cleared when hidden.
   */
  stateClearDelay: number;
}

/**
 * Manager class responsible for handling settings panel auto-hide behavior,
 * including state preservation and extended timeout logic.
 *
 * This class encapsulates all settings panel specific auto-hide logic,
 * keeping it separate from the general UI container logic.
 */
export class SettingsPanelAutoHideManager {
  private openSettingsPanels: SettingsPanel<SettingsPanelConfig>[] = [];
  private lastOpenSettingsPanel: SettingsPanel<SettingsPanelConfig> | null = null;
  private lastSettingsPanelState: SettingsPanelState | null = null;
  private stateClearTimeout: Timeout;
  private readonly stateClearDelay: number;

  constructor(config: SettingsPanelAutoHideManagerConfig) {
    this.stateClearDelay = config.stateClearDelay;
  }

  public onSettingsPanelShow(panel: SettingsPanel<SettingsPanelConfig>): void {
    this.openSettingsPanels.push(panel);
    this.lastOpenSettingsPanel = panel;
  }

  public onSettingsPanelHide(panel: SettingsPanel<SettingsPanelConfig>): void {
    ArrayUtils.remove(this.openSettingsPanels, panel);
  }

  public clearSavedState(): void {
    this.lastOpenSettingsPanel = null;
    this.lastSettingsPanelState = null;
  }

  /**
   * Saves the current state of open settings panels for later restoration
   */
  public saveCurrentState(): void {
    if (this.openSettingsPanels.length > 0) {
      const panel = this.openSettingsPanels[0];
      const panelElement = panel.getDomElement().get(0);
      this.lastOpenSettingsPanel = panel;
      this.lastSettingsPanelState = {
        activePage: panel.getActivePage(),
        navigationStack: [...(panel as any)['navigationStack']], // Copy the array
        scrollTop: panelElement.scrollTop,
        wrapperScrollTop: panel.wrapperScrollTop,
        panelWidth: panelElement.scrollWidth,
        panelHeight: panelElement.scrollHeight,
      };

      // Start timeout to clear saved state after the specified delay
      this.stateClearTimeout = new Timeout(this.stateClearDelay, () => {
        this.clearSavedState();
      });
      this.stateClearTimeout.start();
    }
  }

  /**
   * Restores the last saved settings panel state if available
   */
  public restoreLastState(): void {
    if (this.lastOpenSettingsPanel && this.lastSettingsPanelState && this.openSettingsPanels.length === 0) {
      const panel = this.lastOpenSettingsPanel;
      const state = this.lastSettingsPanelState;

      // Cancel the state clear timeout since we're restoring the state
      if (this.stateClearTimeout) {
        this.stateClearTimeout.clear();
      }

      // Show the panel first
      panel.show();

      // Then restore the navigation state (this will override the resetNavigation call in onShow)
      setTimeout(() => {
        panel.restoreNavigationState(state);
      }, 0);

      // Clear saved state
      this.clearSavedState();
    }
  }

  public hasOpenPanels(): boolean {
    return this.openSettingsPanels.length > 0;
  }

  /**
   * Returns the hide delay of the open settings panel if one is open, otherwise undefined
   */
  public getOpenSettingsPanelHideDelay(): number | undefined {
    if (!this.hasOpenPanels()) return undefined;

    const openPanel = this.openSettingsPanels[0];
    const hideDelay = openPanel.getConfig().hideDelay;

    return hideDelay != null && hideDelay >= 0 ? hideDelay : undefined;
  }

  public release(): void {
    this.openSettingsPanels = [];
    this.clearSavedState();
    if (this.stateClearTimeout) {
      this.stateClearTimeout.clear();
    }
  }
}

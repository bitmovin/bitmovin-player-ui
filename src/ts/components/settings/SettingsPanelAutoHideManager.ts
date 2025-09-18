import { UIInstanceManager } from '../../UIManager';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { SettingsPanelPage } from './SettingsPanelPage';
import { ArrayUtils } from '../../utils/ArrayUtils';
import { Component, ComponentConfig } from '../Component';

/**
 * State interface for preserving settings panel navigation and scroll position
 */
interface SettingsPanelState {
  activePage: SettingsPanelPage;
  navigationStack: SettingsPanelPage[];
  scrollTop: number;
  wrapperScrollTop: number;
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

  constructor(private uimanager: UIInstanceManager) {
    this.setupEventListeners();
  }

  // Sets up event listeners to track settings panel visibility changes
  private setupEventListeners(): void {
    this.uimanager.onComponentShow.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof SettingsPanel) {
        this.onSettingsPanelShow(component);
      }
    });

    this.uimanager.onComponentHide.subscribe((component: Component<ComponentConfig>) => {
      if (component instanceof SettingsPanel) {
        this.onSettingsPanelHide(component);
      }
    });
  }

  private onSettingsPanelShow(panel: SettingsPanel<SettingsPanelConfig>): void {
    this.openSettingsPanels.push(panel);
    this.lastOpenSettingsPanel = panel;
  }

  private onSettingsPanelHide(panel: SettingsPanel<SettingsPanelConfig>): void {
    ArrayUtils.remove(this.openSettingsPanels, panel);
  }

  /**
   * Saves the current state of open settings panels for later restoration
   */
  public saveCurrentState(): void {
    if (this.openSettingsPanels.length > 0) {
      const panel = this.openSettingsPanels[0];
      this.lastOpenSettingsPanel = panel;
      this.lastSettingsPanelState = {
        activePage: panel.getActivePage(),
        navigationStack: [...(panel as any)['navigationStack']], // Copy the array
        scrollTop: panel.getDomElement().get(0).scrollTop,
        wrapperScrollTop: panel.getDomElement().find('.bmpui-container-wrapper').get(0)?.scrollTop || 0
      };
    }
  }

  /**
   * Restores the last saved settings panel state if available
   */
  public restoreLastState(): void {
    if (this.lastOpenSettingsPanel && this.lastSettingsPanelState && this.openSettingsPanels.length === 0) {
      const panel = this.lastOpenSettingsPanel;
      const state = this.lastSettingsPanelState;

      // Show the panel first
      panel.show();

      // Then restore the navigation state (this will override the resetNavigation call in onShow)
      setTimeout(() => {
        panel.restoreNavigationState(
          state.activePage,
          state.navigationStack,
          state.scrollTop,
          state.wrapperScrollTop
        );
      }, 0);

      // Clear saved state
      this.lastOpenSettingsPanel = null;
      this.lastSettingsPanelState = null;
    }
  }

  public hasOpenPanels(): boolean {
    return this.openSettingsPanels.length > 0;
  }

  /**
   * Returns the appropriate hide delay - uses panel's hideDelay if open, normal otherwise
   */
  public getExtendedDelay(baseDelay: number): number {
    if (!this.hasOpenPanels()) return baseDelay;

    const openPanel = this.openSettingsPanels[0];
    return openPanel.getConfig().hideDelay;
  }

  public release(): void {
    this.openSettingsPanels = [];
    this.lastOpenSettingsPanel = null;
    this.lastSettingsPanelState = null;
  }
}
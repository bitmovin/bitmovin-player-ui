import {Button, ButtonConfig} from './button';
import {SettingsPanel} from './settingspanel';
import {SettingsPanelPage} from './settingspanelpage';

/**
 * Configuration interface for a {@link SettingsPanelPageNavigatorButton}
 */
export interface SettingsPanelPageNavigatorConfig extends ButtonConfig {
  /**
   * Container `SettingsPanel` where the navigation takes place
   */
  container: SettingsPanel;
  /**
   * Page where the button should navigate to
   * If empty it will navigate to the root page (not intended to use as navigate back behavior)
   */
  targetPage?: SettingsPanelPage;
}

export class SettingsPanelPageNavigatorButton extends Button<SettingsPanelPageNavigatorConfig> {
  private readonly container: SettingsPanel;
  private readonly targetPage?: SettingsPanelPage;

  constructor(config: SettingsPanelPageNavigatorConfig) {
    super(config);
    this.config = this.mergeConfig(config, {} as SettingsPanelPageNavigatorConfig, this.config);

    this.container = (this.config as SettingsPanelPageNavigatorConfig).container;
    this.targetPage = (this.config as SettingsPanelPageNavigatorConfig).targetPage;
  }

  /**
   * navigate one level back
   */
  popPage() {
    this.container.popSettingsPanelPage();
  }

  /**
   * navigate to the target page
   */
  pushTargetPage() {
    this.container.setActivePage(this.targetPage);
  }
}

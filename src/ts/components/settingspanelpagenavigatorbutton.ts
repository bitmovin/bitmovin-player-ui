import {Button, ButtonConfig} from './button';
import {SettingsPanel} from './settingspanel';
import {SettingsPanelPage} from './settingspanelpage';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';

/**
 * Configuration interface for a {@link SettingsPanelPageNavigatorButton}
 *
 * @category Configs
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

  /**
   * WCAG20 standard: Establishes relationships between objects and their label(s)
   */
  ariaLabelledBy?: string;
}

/**
 * Can be used to navigate between SettingsPanelPages
 *
 * Example:
 *  let settingPanelNavigationButton = new SettingsPanelPageNavigatorButton({
 *    container: settingsPanel,
 *    targetPage: settingsPanelPage,
 *  });
 *
 *  settingsPanelPage.addComponent(settingPanelNavigationButton);
 *
 * Don't forget to add the settingPanelNavigationButton to the settingsPanelPage.
 *
 * @category Buttons
 */
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

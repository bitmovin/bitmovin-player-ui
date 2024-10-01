import { UIInstanceManager } from '../uimanager';
import { ModernSettingsPanelPage } from './modernsettingspanelpage';
import { PlayerAPI } from 'bitmovin-player';
import { SettingsPanel, SettingsPanelConfig, NavigationDirection } from './settingspanel';


export class ModernSettingsPanel extends SettingsPanel {
  constructor(config: SettingsPanelConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-settings-panel',
      hideDelay: 3000,
      pageTransitionAnimation: true,
    } as SettingsPanelConfig, this.config);

    (<ModernSettingsPanelPage>this.getActivePage()).onRequestsDisplaySubMenu.subscribe(this.handleShowSubPage);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    uimanager.onPreviewControlsHide.subscribe(() => {
      this.hide();
    });
  }

  private handleShowSubPage = (sender: ModernSettingsPanelPage, subPage: ModernSettingsPanelPage) => {
    this.show();
    this.addComponent(subPage);
    this.updateComponents();
    this.setActivePage(subPage);
  }

  private handleNavigateBack = (page: ModernSettingsPanelPage) => {
    this.popSettingsPanelPage();
    this.removeComponent(page);
    this.updateComponents();
  }

  protected navigateToPage(
    targetPage: ModernSettingsPanelPage,
    sourcePage: ModernSettingsPanelPage,
    direction: NavigationDirection,
    skipAnimation: boolean,
  ): void {
    super.navigateToPage(targetPage, sourcePage, direction, skipAnimation);

    if (direction === NavigationDirection.Forwards) {
      targetPage.onRequestsDisplaySubMenu.subscribe(this.handleShowSubPage);
      targetPage.onRequestsNavigateBack.subscribe(() => this.handleNavigateBack(targetPage));
    }
  }
}

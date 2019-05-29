import { SettingsPanel } from '../../src/ts/components/settingspanel';
import { MockHelper } from '../helper/MockHelper';
import { SettingsPanelPage } from '../../src/ts/components/settingspanelpage';

let settingsPanel: SettingsPanel;

describe('SettingsPanel', () => {
  describe('popSettingsPanelPage', () => {
    let rootPage = new SettingsPanelPage({});
    let firstPage = new SettingsPanelPage({});
    let secondPage = new SettingsPanelPage({});

    it('pops from third page pack to root page one after popping two times', () => {
      settingsPanel = new SettingsPanel({
        components: [rootPage, firstPage, secondPage],
      });

      settingsPanel.configure(MockHelper.getPlayerMock(), MockHelper.getUiInstanceManagerMock());

      // Navigates to levels
      settingsPanel.setActivePage(firstPage);
      settingsPanel.setActivePage(secondPage);

      // Popping to levels back again
      settingsPanel.popSettingsPanelPage();
      settingsPanel.popSettingsPanelPage();

      // Expect to be back at the root page
      expect(settingsPanel.getActivePage()).toEqual(rootPage);
    });
  });
});

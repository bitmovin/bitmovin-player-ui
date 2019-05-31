import { SettingsPanel } from '../../src/ts/components/settingspanel';
import { MockHelper } from '../helper/MockHelper';
import { SettingsPanelPage } from '../../src/ts/components/settingspanelpage';

let settingsPanel: SettingsPanel;

describe('SettingsPanel', () => {
  describe('page navigation', () => {
    let rootPage: SettingsPanelPage;
    let firstPage: SettingsPanelPage;
    let secondPage: SettingsPanelPage;

    beforeEach(() => {
      rootPage = new SettingsPanelPage({});
      firstPage = new SettingsPanelPage({});
      secondPage = new SettingsPanelPage({});

      settingsPanel = new SettingsPanel({
        components: [rootPage, firstPage, secondPage],
      });
      const uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
      settingsPanel.configure(MockHelper.getPlayerMock(), uiInstanceManagerMock);
    });

    describe('popSettingsPanelPage', () => {
      it('pops from third page pack to root page one after popping two times', () => {
        // Navigates to levels
        settingsPanel.setActivePage(firstPage);
        settingsPanel.setActivePage(secondPage);

        // Popping to levels back again
        settingsPanel.popSettingsPanelPage();
        settingsPanel.popSettingsPanelPage();

        // Expect to be back at the root page
        expect(settingsPanel.getActivePage()).toEqual(rootPage);
      });

      it('navigates back one level', () => {
        settingsPanel.setActivePage(firstPage);
        settingsPanel.setActivePage(secondPage);

        // Popping to levels back again
        settingsPanel.popSettingsPanelPage();

        expect(settingsPanel.getActivePage()).toEqual(firstPage);
      });
    });

    describe('getActivePage', () => {
      it('returns the root page if no navigation happened', () => {
        expect(settingsPanel.getActivePage()).toEqual(rootPage);
      });
    });

    describe('setActivePageIndex', () => {
      it('returns the page at index', () => {
        settingsPanel.setActivePageIndex(1);
        expect(settingsPanel.getActivePage()).toEqual(firstPage);
      });

      it('doesn\'t push the current page again', () => {
        settingsPanel.setActivePageIndex(1);
        settingsPanel.setActivePageIndex(1);

        // Not testable with public methods
        expect((settingsPanel as any).navigationStack.length).toEqual(1);
        expect(settingsPanel.getActivePage()).toEqual(firstPage);
      });
    });

    describe('setActivePage', () => {
      it('returns the set page', () => {
        settingsPanel.setActivePage(secondPage);
        expect(settingsPanel.getActivePage()).toEqual(secondPage);
      });

      it('doesn\'t push the current page again', () => {
        settingsPanel.setActivePage(secondPage);
        settingsPanel.setActivePage(secondPage);

        // Not testable with public methods
        expect((settingsPanel as any).navigationStack.length).toEqual(1);
        expect(settingsPanel.getActivePage()).toEqual(secondPage);
      });
    });

    describe('popToRootSettingsPanelPage', () => {
      it('navigates back to the root page', () => {
        settingsPanel.setActivePage(secondPage);
        settingsPanel.setActivePage(firstPage);

        settingsPanel.popToRootSettingsPanelPage();
        expect(settingsPanel.getActivePage()).toEqual(rootPage);
      });
    });

    it('resets the navigation when the panel closes', () => {
      settingsPanel.setActivePage(secondPage);
      settingsPanel.setActivePage(firstPage);

      // Fake hide event
      (settingsPanel as any).componentEvents.onHide.dispatch(settingsPanel);
      expect(settingsPanel.getActivePage()).toEqual(rootPage);
    });
  });
});

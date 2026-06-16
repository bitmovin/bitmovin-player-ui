import type { PlayerAPI } from 'bitmovin-player';

import { DOM } from '../../../src/ts/DOM';
import type { Component, ComponentConfig } from '../../../src/ts/components/Component';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { SettingsToggleButton } from '../../../src/ts/components/settings/SettingsToggleButton';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';

describe('SettingsToggleButton', () => {
  describe('settings panel visibility', () => {
    let playerMock: PlayerAPI;
    let uiInstanceManagerMock: UIInstanceManager;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

      jest.spyOn(SettingsToggleButton.prototype, 'getDomElement').mockReturnValue(MockHelper.generateDOMMock());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('hides visible settings panels by default when opening its settings panel', () => {
      const settingsPanel = createSettingsPanel({ hidden: true });
      const otherSettingsPanel = createSettingsPanel();
      const settingsToggleButton = configureSettingsToggleButton(settingsPanel);
      const onComponentShowHandler = getOnComponentShowHandler();
      const hideSpy = jest.spyOn(otherSettingsPanel, 'hide');

      onComponentShowHandler(otherSettingsPanel);

      settingsToggleButton['onClickEvent']();

      expect(hideSpy).toHaveBeenCalled();
    });

    it('does not hide visible settings panels that opt out when opening its settings panel', () => {
      const settingsPanel = createSettingsPanel({ hidden: true });
      const persistentSettingsPanel = createSettingsPanel({ hideOnOtherSettingsPanelOpening: false });
      const settingsToggleButton = configureSettingsToggleButton(settingsPanel);
      const onComponentShowHandler = getOnComponentShowHandler();
      const hideSpy = jest.spyOn(persistentSettingsPanel, 'hide');

      onComponentShowHandler(persistentSettingsPanel);

      settingsToggleButton['onClickEvent']();

      expect(hideSpy).not.toHaveBeenCalled();
    });

    function createSettingsPanel(config: SettingsPanelConfig = {}): SettingsPanel<SettingsPanelConfig> {
      const settingsPanel = new SettingsPanel<SettingsPanelConfig>({
        ...config,
        components: [new SettingsPanelPage({})],
      });
      settingsPanel.initialize();

      return settingsPanel;
    }

    function configureSettingsToggleButton(settingsPanel: SettingsPanel<SettingsPanelConfig>): SettingsToggleButton {
      const settingsToggleButton = new SettingsToggleButton({ settingsPanel });
      settingsToggleButton.configure(playerMock, uiInstanceManagerMock);

      return settingsToggleButton;
    }

    function getOnComponentShowHandler(): (component: Component<ComponentConfig>) => void {
      return MockHelper.getMockCallArg<(component: Component<ComponentConfig>) => void>(
        uiInstanceManagerMock.onComponentShow.subscribe as jest.Mock,
      );
    }
  });

  describe('ARIA wiring', () => {
    let panel: SettingsPanel<SettingsPanelConfig>;
    let attrSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on DOM.attr before constructing the button so constructor calls are captured.
      attrSpy = jest.spyOn(DOM.prototype, 'attr');
      panel = new SettingsPanel({ components: [new SettingsPanelPage({})], hidden: true });
    });

    afterEach(() => {
      attrSpy.mockRestore();
    });

    it('does not configure the invalid `pop-up button` role', () => {
      const button = new SettingsToggleButton({ settingsPanel: panel });

      expect(button.getConfig().role).toBe('button');
    });

    it('sets aria-haspopup, aria-controls, and aria-expanded on the DOM element', () => {
      new SettingsToggleButton({ settingsPanel: panel });
      const calls = attrSpy.mock.calls.map(([name, value]: [string, string]) => `${name}=${value}`);
      const panelId = panel.getActivePage().getConfig().id;

      expect(calls).toEqual(
        expect.arrayContaining(['aria-haspopup=menu', `aria-controls=${panelId}`, 'aria-expanded=false']),
      );
    });

    it('does not set aria-owns', () => {
      new SettingsToggleButton({ settingsPanel: panel });
      const names = attrSpy.mock.calls.map(([name]: [string]) => name);

      expect(names).not.toContain('aria-owns');
    });

    it('flips aria-expanded when the panel show / hide events fire', () => {
      const button = new SettingsToggleButton({ settingsPanel: panel });
      const playerMock = MockHelper.getPlayerMock();
      const uiManagerMock = MockHelper.getUiInstanceManagerMock();
      panel.configure(playerMock, uiManagerMock);
      button.configure(playerMock, uiManagerMock);

      attrSpy.mockClear();

      panel.hide();
      expect(attrSpy).toHaveBeenCalledWith('aria-expanded', 'false');

      panel.show();
      expect(attrSpy).toHaveBeenCalledWith('aria-expanded', 'true');
    });

    it('refreshes aria-controls when the panel active page changes', () => {
      const secondPage = new SettingsPanelPage({});
      panel = new SettingsPanel({
        components: [new SettingsPanelPage({}), secondPage],
        hidden: true,
      });
      const button = new SettingsToggleButton({ settingsPanel: panel });
      const playerMock = MockHelper.getPlayerMock();
      const uiManagerMock = MockHelper.getUiInstanceManagerMock();
      panel.configure(playerMock, uiManagerMock);
      button.configure(playerMock, uiManagerMock);

      attrSpy.mockClear();

      panel.setActivePage(secondPage);
      const newId = secondPage.getConfig().id;

      expect(attrSpy).toHaveBeenCalledWith('aria-controls', newId);
    });
  });
});

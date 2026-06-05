import type { PlayerAPI } from 'bitmovin-player';

import type { Component, ComponentConfig } from '../../../src/ts/components/Component';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { SettingsToggleButton } from '../../../src/ts/components/settings/SettingsToggleButton';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';

describe('SettingsToggleButton', () => {
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
    const persistentSettingsPanel = createSettingsPanel({ hideWithOtherSettingsPanels: false });
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

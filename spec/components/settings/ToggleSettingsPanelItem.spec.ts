import type { PlayerAPI } from 'bitmovin-player';

import { ToggleButton } from '../../../src/ts/components/buttons/ToggleButton';
import { ToggleSettingsPanelItem } from '../../../src/ts/components/settings/ToggleSettingsPanelItem';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';

describe('ToggleSettingsPanelItem', () => {
  let playerMock: PlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  it('toggles the button when the settings row is clicked', () => {
    const toggleButton = new ToggleButton({});
    const settingsPanelItem = configureToggleSettingsPanelItem(toggleButton);

    settingsPanelItem['onClickEvent']();

    expect(toggleButton.isOn()).toBe(true);
    expect(settingsPanelItem.getDomElement().get(0).getAttribute('aria-checked')).toBe('true');
  });

  it('does not toggle twice when the button itself is clicked', () => {
    const toggleButton = new ToggleButton({});
    const settingsPanelItem = configureToggleSettingsPanelItem(toggleButton);
    toggleButton.onClick.subscribe(() => toggleButton.toggle());

    toggleButton.getDomElement().get(0).click();

    expect(toggleButton.isOn()).toBe(true);
    expect(settingsPanelItem.getDomElement().get(0).getAttribute('aria-checked')).toBe('true');
  });

  it('removes the button from keyboard focus', () => {
    const toggleButton = new ToggleButton({});

    configureToggleSettingsPanelItem(toggleButton);

    expect(toggleButton.getDomElement().get(0).getAttribute('tabindex')).toBe('-1');
  });

  it('adds the toggle settings panel item CSS class', () => {
    const toggleButton = new ToggleButton({});
    const settingsPanelItem = configureToggleSettingsPanelItem(toggleButton);

    expect(settingsPanelItem.getConfig().cssClasses).toContain('ui-toggle-settings-panel-item');
  });

  function configureToggleSettingsPanelItem(toggleButton: ToggleButton<any>): ToggleSettingsPanelItem {
    const settingsPanelItem = new ToggleSettingsPanelItem({
      label: 'toggle',
      settingComponent: toggleButton,
    });

    toggleButton.initialize();
    settingsPanelItem.initialize();
    toggleButton.configure(playerMock, uiInstanceManagerMock);
    settingsPanelItem.configure(playerMock, uiInstanceManagerMock);

    return settingsPanelItem;
  }
});

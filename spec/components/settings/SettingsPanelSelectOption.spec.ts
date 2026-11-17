import type { PlayerAPI } from 'bitmovin-player';

import { ListBox } from '../../../src/ts/components/lists/ListBox';
import { ListSelector, ListSelectorConfig } from '../../../src/ts/components/lists/ListSelector';
import { SettingsPanelSelectOption } from '../../../src/ts/components/settings/SettingsPanelSelectOption';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';

class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {}

describe('SettingsPanelSelectOption', () => {
  let playerMock: PlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let listSelector: ListSelectorTestClass;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    listSelector = new ListSelectorTestClass();
    listSelector.addItem('low', 'Low');
    listSelector.addItem('high', 'High');
  });

  it('should render as a menuitemradio', () => {
    const selectOption = configureSelectOption('low');

    expect(getAttribute(selectOption, 'role')).toBe('menuitemradio');
  });

  it.each`
    selectedKey  | expectedLow | expectedHigh
    ${'low'}     | ${'true'}   | ${'false'}
    ${'high'}    | ${'false'}  | ${'true'}
    ${undefined} | ${'false'}  | ${'false'}
  `(
    'should set the initial aria-checked state when "$selectedKey" is selected',
    ({ selectedKey, expectedLow, expectedHigh }) => {
      if (selectedKey) {
        listSelector.selectItem(selectedKey);
      }

      const lowOption = configureSelectOption('low');
      const highOption = configureSelectOption('high');

      expect(getAttribute(lowOption, 'aria-checked')).toBe(expectedLow);
      expect(getAttribute(highOption, 'aria-checked')).toBe(expectedHigh);
    },
  );

  it('should update aria-checked when the selection changes on the setting', () => {
    listSelector.selectItem('low');
    const lowOption = configureSelectOption('low');
    const highOption = configureSelectOption('high');

    listSelector.selectItem('high');

    expect(getAttribute(lowOption, 'aria-checked')).toBe('false');
    expect(getAttribute(highOption, 'aria-checked')).toBe('true');
  });

  it('should mark the option as checked when it is clicked', () => {
    listSelector.selectItem('low');
    const lowOption = configureSelectOption('low');
    const highOption = configureSelectOption('high');

    highOption['onClickEvent']();

    expect(getAttribute(lowOption, 'aria-checked')).toBe('false');
    expect(getAttribute(highOption, 'aria-checked')).toBe('true');
  });

  it('should expose the selected state on the options of a ListBox', () => {
    listSelector.selectItem('high');
    const listBox = new ListBox({ listSelector });
    listBox.configure(playerMock, uiInstanceManagerMock);

    const options = listBox['settingsPanelPage']
      .getComponents()
      .filter(component => component instanceof SettingsPanelSelectOption);

    expect(options.map(option => getAttribute(option, 'role'))).toEqual(['menuitemradio', 'menuitemradio']);
    expect(options.map(option => getAttribute(option, 'aria-checked'))).toEqual(['false', 'true']);

    listSelector.selectItem('low');

    expect(options.map(option => getAttribute(option, 'aria-checked'))).toEqual(['true', 'false']);
  });

  function configureSelectOption(settingsValue: string): SettingsPanelSelectOption {
    const selectOption = new SettingsPanelSelectOption({
      label: settingsValue,
      settingComponent: listSelector,
      settingsValue,
      addSettingAsComponent: false,
    });

    selectOption.configure(playerMock, uiInstanceManagerMock);

    return selectOption;
  }

  function getAttribute(component: { getDomElement(): { get(index: number): HTMLElement } }, name: string): string {
    return component.getDomElement().get(0).getAttribute(name);
  }
});

import { SettingsPanel, SettingsPanelConfig } from '../../src/ts/components/settings/SettingsPanel';
import { InteractiveSettingsPanelItem } from '../../src/ts/components/settings/InteractiveSettingsPanelItem';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../src/ts/components/settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../src/ts/components/settings/SettingsPanelPage';
import { SettingsPanelNavigationGroup } from '../../src/ts/spatialnavigation/SettingsPanelNavigationGroup';

type Item = InteractiveSettingsPanelItem<SettingsPanelItemConfig>;

describe('SettingsPanelNavigationGroup', () => {
  let settingsPanel: SettingsPanel<SettingsPanelConfig>;
  let items: Item[];
  let group: SettingsPanelNavigationGroup;

  beforeEach(() => {
    items = ['First', 'Second', 'Third'].map(label => new InteractiveSettingsPanelItem({ label, tabIndex: 0 }));
    settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({ components: items })] });
    document.body.appendChild(settingsPanel.getDomElement().get(0));
    group = new SettingsPanelNavigationGroup(settingsPanel);
  });

  afterEach(() => {
    group.release();
    document.body.innerHTML = '';
  });

  it.each`
    key       | expected
    ${'Home'} | ${0}
    ${'End'}  | ${2}
  `('should make the item that $key focuses the active component', ({ key, expected }) => {
    group.enable();
    group['focusComponent'](items[1]);

    const event = press(key);

    expect(group.getActiveComponent()).toBe(items[expected]);
    expect(document.activeElement).toBe(items[expected].getDomElement().get(0));
    expect(event.defaultPrevented).toBe(true);
  });

  it('should skip hidden items on End', () => {
    items[2].hide();
    group.enable();

    press('End');

    expect(group.getActiveComponent()).toBe(items[1]);
  });

  it('should skip the label of a title row on Home', () => {
    group.release();
    document.body.innerHTML = '';
    const titleRow = new SettingsPanelItem({ label: 'Title', isSetting: false });
    settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({ components: [titleRow, ...items] })] });
    document.body.appendChild(settingsPanel.getDomElement().get(0));
    group = new SettingsPanelNavigationGroup(settingsPanel);
    group.enable();
    group['focusComponent'](items[2]);

    press('Home');

    expect(group.getActiveComponent()).toBe(items[0]);
  });

  it('should leave Home and End alone while the group is disabled', () => {
    group.enable();
    group.disable();

    const event = press('End');

    expect(event.defaultPrevented).toBe(false);
  });

  it('should stop handling Home and End once released', () => {
    group.enable();
    group.release();

    const event = press('End');

    expect(event.defaultPrevented).toBe(false);
  });

  function press(key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    (document.activeElement ?? document.body).dispatchEvent(event);
    return event;
  }
});

import { Button, ButtonConfig } from '../../../src/ts/components/buttons/Button';
import { InteractiveSettingsPanelItem } from '../../../src/ts/components/settings/InteractiveSettingsPanelItem';
import { SelectBox } from '../../../src/ts/components/settings/SelectBox';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelItem, SettingsPanelItemConfig } from '../../../src/ts/components/settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { MockHelper } from '../../helper/MockHelper';

type Item = SettingsPanelItem<SettingsPanelItemConfig>;

describe('SettingsPanel menu keyboard navigation', () => {
  let settingsPanel: SettingsPanel<SettingsPanelConfig>;
  let quality: Item;
  let speed: Item;
  let audio: Item;

  beforeEach(() => {
    quality = menuItem('Quality');
    speed = menuItem('Speed');
    audio = menuItem('Audio');
    settingsPanel = mountPanel(new SettingsPanelPage({ components: [quality, speed, audio] }));
  });

  afterEach(() => {
    settingsPanel.release();
    document.body.innerHTML = '';
  });

  it.each`
    start        | key            | expected
    ${'Quality'} | ${'ArrowDown'} | ${'Speed'}
    ${'Speed'}   | ${'ArrowUp'}   | ${'Quality'}
    ${'Audio'}   | ${'ArrowDown'} | ${'Quality'}
    ${'Quality'} | ${'ArrowUp'}   | ${'Audio'}
    ${'Speed'}   | ${'Home'}      | ${'Quality'}
    ${'Speed'}   | ${'End'}       | ${'Audio'}
  `('should move focus from $start to $expected on $key', ({ start, key, expected }) => {
    focus(itemByLabel(start));

    const event = press(key);

    expect(focusedLabel()).toBe(expected);
    expect(event.defaultPrevented).toBe(true);
  });

  it.each(['ArrowDown', 'Home'])('should focus the first item on %s while the panel itself has focus', key => {
    focus(settingsPanel.getDomElement().get(0));

    press(key);

    expect(focusedLabel()).toBe('Quality');
  });

  it.each(['ArrowUp', 'End'])('should focus the last item on %s while the panel itself has focus', key => {
    focus(settingsPanel.getDomElement().get(0));

    press(key);

    expect(focusedLabel()).toBe('Audio');
  });

  it('should skip hidden items', () => {
    speed.hide();
    focus(quality.getDomElement().get(0));

    press('ArrowDown');

    expect(focusedLabel()).toBe('Audio');
  });

  it.each(['Tab', 'Enter', 'ArrowLeft', 'ArrowRight'])('should leave %s to the focused item', key => {
    focus(quality.getDomElement().get(0));

    const event = press(key);

    expect(focusedLabel()).toBe('Quality');
    expect(event.defaultPrevented).toBe(false);
  });

  it('should ignore keys that another handler already consumed', () => {
    const qualityElement = quality.getDomElement().get(0);
    qualityElement.addEventListener('keydown', event => event.preventDefault());
    focus(qualityElement);

    press('ArrowDown');

    expect(focusedLabel()).toBe('Quality');
  });

  it('should ignore keys with modifiers', () => {
    focus(quality.getDomElement().get(0));

    press('ArrowDown', { altKey: true });

    expect(focusedLabel()).toBe('Quality');
  });

  it('should stop handling keys once the panel is released', () => {
    focus(quality.getDomElement().get(0));
    settingsPanel.release();

    const event = press('ArrowDown');

    expect(focusedLabel()).toBe('Quality');
    expect(event.defaultPrevented).toBe(false);
  });

  describe('with title rows and nested controls', () => {
    let backButton: Button<ButtonConfig>;
    let option: Item;

    beforeEach(() => {
      settingsPanel.release();
      document.body.innerHTML = '';

      backButton = new Button({ text: 'Back', role: 'menuitem' });
      option = menuItem('Option');
      const titleRow = new SettingsPanelItem({ components: [backButton], isSetting: false });
      settingsPanel = mountPanel(new SettingsPanelPage({ components: [titleRow, option] }));
    });

    it('should move between the controls of a title row and the items, but not to the row itself', () => {
      focus(option.getDomElement().get(0));

      press('ArrowDown');
      expect(document.activeElement).toBe(backButton.getDomElement().get(0));

      press('ArrowDown');
      expect(focusedLabel()).toBe('Option');
    });
  });

  describe('with rows that wrap a focusable control', () => {
    let selectBox: SelectBox;

    beforeEach(() => {
      settingsPanel.release();
      document.body.innerHTML = '';

      selectBox = new SelectBox();
      const classicRow = new SettingsPanelItem({ components: [selectBox] });
      settingsPanel = mountPanel(new SettingsPanelPage({ components: [menuItem('Quality'), classicRow] }));
    });

    it('should focus the control inside a row that is not focusable itself', () => {
      focus(itemByLabel('Quality'));

      press('ArrowDown');

      expect(document.activeElement).toBe(selectBox.getDomElement().get(0));
    });

    it('should leave the arrow keys to a native select', () => {
      const selectElement = selectBox.getDomElement().get(0);
      focus(selectElement);

      const event = press('ArrowDown');

      expect(document.activeElement).toBe(selectElement);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('with an interactive item that is not in the tab order', () => {
    beforeEach(() => {
      settingsPanel.release();
      document.body.innerHTML = '';

      // tabIndex -1 is the default inherited from Component, the page can still focus the item initially
      const interactive = new InteractiveSettingsPanelItem<SettingsPanelItemConfig>({ label: 'Interactive' });
      settingsPanel = mountPanel(new SettingsPanelPage({ components: [interactive, menuItem('Quality')] }));
    });

    it('should move from and to the interactive item', () => {
      focus(itemByLabel('Interactive'));

      press('ArrowDown');
      expect(focusedLabel()).toBe('Quality');

      press('ArrowDown');
      expect(focusedLabel()).toBe('Interactive');
    });
  });

  describe('with a row whose first control is hidden or disabled', () => {
    let selectBox: SelectBox;

    beforeEach(() => {
      settingsPanel.release();
      document.body.innerHTML = '';

      selectBox = new SelectBox();
      const hiddenButton = new Button<ButtonConfig>({ text: 'Hidden' });
      hiddenButton.hide();
      const disabledButton = new Button<ButtonConfig>({ text: 'Disabled' });
      disabledButton.getDomElement().attr('disabled', 'true');
      const row = new SettingsPanelItem({ components: [hiddenButton, disabledButton, selectBox] });
      settingsPanel = mountPanel(new SettingsPanelPage({ components: [menuItem('Quality'), row] }));
    });

    it('should focus the first control that can take focus', () => {
      focus(itemByLabel('Quality'));

      press('ArrowDown');

      expect(document.activeElement).toBe(selectBox.getDomElement().get(0));
    });
  });

  describe('with several pages', () => {
    let subPageOption: Item;

    beforeEach(() => {
      settingsPanel.release();
      document.body.innerHTML = '';

      subPageOption = menuItem('Sub option');
      const rootPage = new SettingsPanelPage({ components: [menuItem('Root item')] });
      const subPage = new SettingsPanelPage({ components: [subPageOption, menuItem('Other sub option')] });
      settingsPanel = mountPanel(rootPage, subPage);
      settingsPanel.setActivePage(subPage);
    });

    it('should only move between the items of the active page', () => {
      focus(itemByLabel('Other sub option'));

      press('ArrowDown');

      expect(focusedLabel()).toBe('Sub option');
    });
  });

  function menuItem(label: string): Item {
    return new SettingsPanelItem({ label, tabIndex: 0 });
  }

  function mountPanel(...pages: SettingsPanelPage[]): SettingsPanel<SettingsPanelConfig> {
    const panel = new SettingsPanel({ components: pages, pageTransitionAnimation: false });
    panel.configure(MockHelper.getPlayerMock(), MockHelper.getUiInstanceManagerMock());
    // Focus only moves between elements that are connected to the document
    document.body.appendChild(panel.getDomElement().get(0));
    return panel;
  }

  function itemByLabel(label: string): HTMLElement {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const item = items.find(element => element.textContent === label);
    if (!item) {
      throw new Error(`no menu item labelled ${label}`);
    }
    return item;
  }

  function focus(element: HTMLElement): void {
    element.focus();
    expect(document.activeElement).toBe(element);
  }

  function focusedLabel(): string {
    return (document.activeElement as HTMLElement).textContent;
  }

  function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    document.activeElement.dispatchEvent(event);
    return event;
  }
});

import type { PlayerAPI } from 'bitmovin-player';

import { Button, ButtonConfig } from '../../../src/ts/components/buttons/Button';
import type { Component, ComponentConfig, ViewModeChangedEventArgs } from '../../../src/ts/components/Component';
import { ContextMenu } from '../../../src/ts/components/contextmenu/ContextMenu';
import {
  InteractiveContextMenuItem,
  InteractiveContextMenuItemConfig,
} from '../../../src/ts/components/contextmenu/InteractiveContextMenuItem';
import { ContextMenuConfig } from '../../../src/ts/components/contextmenu/ContextMenu';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { SettingsToggleButton } from '../../../src/ts/components/settings/SettingsToggleButton';
import { UIContainer } from '../../../src/ts/components/UIContainer';
import { EventDispatcher, NoArgs } from '../../../src/ts/EventDispatcher';
import { SettingsPanelNavigationGroup } from '../../../src/ts/spatialnavigation/SettingsPanelNavigationGroup';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { FocusUtils } from '../../../src/ts/utils/FocusUtils';

// These specs need the real DOM to observe focus, so they deliberately do not use MockHelper, which mocks `DOM`.
function createPlayer(): PlayerAPI {
  return { on: jest.fn(), off: jest.fn(), exports: { PlayerEvent: {} } } as unknown as PlayerAPI;
}

function createUiManager(ui: UIContainer): UIInstanceManager {
  return {
    getUI: () => ui,
    getConfig: () => ({}),
    onControlsShow: new EventDispatcher<UIContainer, NoArgs>(),
    onControlsHide: new EventDispatcher<UIContainer, NoArgs>(),
    onComponentShow: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onComponentHide: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
    onComponentViewModeChanged: new EventDispatcher<Component<ComponentConfig>, ViewModeChangedEventArgs>(),
    onActive: new EventDispatcher<UIInstanceManager, NoArgs>(),
    onInactive: new EventDispatcher<UIInstanceManager, NoArgs>(),
  } as unknown as UIInstanceManager;
}

function element(component: Component<ComponentConfig>): HTMLElement {
  return component.getDomElement().get(0);
}

function button(config: ButtonConfig = {}): Button<ButtonConfig> {
  return new Button(config);
}

describe('SettingsPanel focus management', () => {
  let opener: Button<ButtonConfig>;
  let firstItem: Button<ButtonConfig>;
  let secondItem: Button<ButtonConfig>;
  let backButton: Button<ButtonConfig>;
  let rootPage: SettingsPanelPage;
  let subPage: SettingsPanelPage;
  let settingsPanel: SettingsPanel<SettingsPanelConfig>;

  beforeEach(() => {
    opener = button();
    firstItem = button();
    secondItem = button();
    backButton = button();
    rootPage = new SettingsPanelPage({ components: [firstItem, secondItem] });
    subPage = new SettingsPanelPage({ components: [backButton] });
    settingsPanel = new SettingsPanel({ components: [rootPage, subPage], hidden: true, hideDelay: -1 });

    const ui = new UIContainer({ components: [opener, settingsPanel] });
    document.body.appendChild(element(ui));
    settingsPanel.initialize();
    settingsPanel.configure(createPlayer(), createUiManager(ui));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return focus to the element that had it before the panel opened', () => {
    element(opener).focus();
    settingsPanel.show();
    element(secondItem).focus();

    settingsPanel.hide();

    expect(document.activeElement).toBe(element(opener));
  });

  it('should not move focus when it is outside the panel while the panel closes', () => {
    const elsewhere = document.createElement('button');
    document.body.appendChild(elsewhere);
    element(opener).focus();
    settingsPanel.show();
    elsewhere.focus();

    settingsPanel.hide();

    expect(document.activeElement).toBe(elsewhere);
  });

  it('should focus the item that opened a sub-page when navigating back', () => {
    settingsPanel.show();
    element(secondItem).focus();
    settingsPanel.setActivePage(subPage);
    element(backButton).focus();

    settingsPanel.popSettingsPanelPage();

    expect(document.activeElement).toBe(element(secondItem));
  });

  it('should not move focus into the panel when navigating back while focus is outside of it', () => {
    settingsPanel.show();
    element(secondItem).focus();
    settingsPanel.setActivePage(subPage);
    element(opener).focus();

    settingsPanel.popSettingsPanelPage();

    expect(document.activeElement).toBe(element(opener));
  });

  it('should keep a hidden panel out of the tab sequence', () => {
    expect(element(settingsPanel).hasAttribute('inert')).toBe(true);

    settingsPanel.show();
    expect(element(settingsPanel).hasAttribute('inert')).toBe(false);

    settingsPanel.hide();
    expect(element(settingsPanel).hasAttribute('inert')).toBe(true);
  });

  describe('SettingsToggleButton', () => {
    let toggleButton: SettingsToggleButton;

    beforeEach(() => {
      toggleButton = new SettingsToggleButton({ settingsPanel, autoHideWhenNoActiveSettings: false });
      element(opener).parentElement.appendChild(element(toggleButton));
      toggleButton.configure(createPlayer(), createUiManager(null));
      // jsdom does no layout, so it cannot tell which elements are rendered and therefore tabbable.
      jest.spyOn(FocusUtils, 'getTabbableElements').mockImplementation(() => [element(firstItem), element(secondItem)]);
      element(toggleButton).focus();
      settingsPanel.show();
    });

    afterEach(() => {
      toggleButton.release();
      jest.restoreAllMocks();
    });

    function pressTab(target: HTMLElement, shiftKey = false): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    }

    it('should close the panel and focus the button on Shift+Tab from the first item', () => {
      element(firstItem).focus();

      const event = pressTab(element(firstItem), true);

      expect(event.defaultPrevented).toBe(true);
      expect(settingsPanel.isHidden()).toBe(true);
      expect(document.activeElement).toBe(element(toggleButton));
    });

    it('should close the panel and let Tab continue from the button on the last item', () => {
      element(secondItem).focus();

      const event = pressTab(element(secondItem));

      expect(event.defaultPrevented).toBe(false);
      expect(settingsPanel.isHidden()).toBe(true);
      expect(document.activeElement).toBe(element(toggleButton));
    });

    it('should leave Tab between items to the browser', () => {
      element(firstItem).focus();

      const event = pressTab(element(firstItem));

      expect(event.defaultPrevented).toBe(false);
      expect(settingsPanel.isShown()).toBe(true);
      expect(document.activeElement).toBe(element(firstItem));
    });

    it('should stop handling Tab once the panel is hidden', () => {
      settingsPanel.hide();
      settingsPanel.getDomElement().removeAttr('inert');
      element(secondItem).focus();

      pressTab(element(secondItem));

      expect(document.activeElement).toBe(element(secondItem));
    });
  });

  describe('SettingsPanelNavigationGroup', () => {
    it('should continue spatial navigation from the item that opened a sub-page after navigating back', () => {
      const navigationGroup = new SettingsPanelNavigationGroup(settingsPanel);
      settingsPanel.show();
      navigationGroup.enable();
      // Plain buttons are not settings panel items, so the group resolves the page's components directly.
      jest
        .spyOn(navigationGroup, 'getComponents')
        .mockImplementation(() => settingsPanel.getActivePage().getComponents());
      navigationGroup['focusComponent'](secondItem);
      settingsPanel.setActivePage(subPage);

      settingsPanel.popSettingsPanelPage();

      expect(document.activeElement).toBe(element(secondItem));
      expect(navigationGroup.getActiveComponent()).toBe(secondItem);
      navigationGroup.release();
    });
  });
});

describe('ContextMenu focus management', () => {
  it('should move focus into the menu when it opens and return it when it closes', () => {
    const opener = button();
    const item = new InteractiveContextMenuItem<InteractiveContextMenuItemConfig>({ label: 'Item' });
    const contextMenu = new ContextMenu<ContextMenuConfig>({
      components: [new SettingsPanelPage({ components: [item] })],
    });
    const ui = new UIContainer({ components: [opener, contextMenu] });
    document.body.appendChild(element(ui));
    contextMenu.initialize();
    contextMenu.configure(createPlayer(), createUiManager(ui));
    // jsdom does no layout, so it cannot tell which elements are rendered and therefore tabbable.
    jest.spyOn(FocusUtils, 'getTabbableElements').mockImplementation(() => [element(item)]);
    element(opener).focus();

    contextMenu.showAt(0, 0);
    expect(document.activeElement).toBe(element(item));

    contextMenu.hideAndReset();
    expect(document.activeElement).toBe(element(opener));

    jest.restoreAllMocks();
    contextMenu.release();
    document.body.innerHTML = '';
  });
});

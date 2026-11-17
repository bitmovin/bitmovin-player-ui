import type { PlayerAPI } from 'bitmovin-player';

import { ContextMenu } from '../../../src/ts/components/contextmenu/ContextMenu';
import { PlayerContextMenu } from '../../../src/ts/components/contextmenu/PlayerContextMenu';
import { Label } from '../../../src/ts/components/labels/Label';
import { ListBox } from '../../../src/ts/components/lists/ListBox';
import { ListSelector, ListSelectorConfig } from '../../../src/ts/components/lists/ListSelector';
import { PlayerInsightsPanel } from '../../../src/ts/components/panels/player-insights/PlayerInsightsPanel';
import { DynamicSettingsPanelItem } from '../../../src/ts/components/settings/DynamicSettingsPanelItem';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelItem } from '../../../src/ts/components/settings/SettingsPanelItem';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { SettingsPanelPageBackButton } from '../../../src/ts/components/settings/SettingsPanelPageBackButton';
import { SettingsPanelPageOpenButton } from '../../../src/ts/components/settings/SettingsPanelPageOpenButton';
import { SettingsToggleButton } from '../../../src/ts/components/settings/SettingsToggleButton';
import { SubtitleSettingsResetButton } from '../../../src/ts/components/settings/subtitlesettings/SubtitleSettingsResetButton';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';

class ListSelectorTestClass extends ListSelector<ListSelectorConfig> {}

type AnyComponent = { getDomElement(): { get(index: number): HTMLElement } };

describe('Settings menu roles', () => {
  let playerMock: PlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('SettingsPanelItem', () => {
    it('should expose a setting row as a menu item', () => {
      const item = new SettingsPanelItem({ label: 'Quality' });

      expect(attribute(item, 'role')).toBe('menuitem');
      expect(attribute(item, 'tabindex')).toBe('-1');
    });

    it('should not expose a title row as a menu item', () => {
      const titleRow = new SettingsPanelItem({ label: 'Subtitles', isSetting: false });

      expect(attribute(titleRow, 'role')).toBe('none');
      // Browsers ignore role="none" on focusable elements
      expect(attribute(titleRow, 'tabindex')).toBeNull();
    });

    it('should keep a role that is configured explicitly on a title row', () => {
      const titleRow = new SettingsPanelItem({ label: 'Subtitles', isSetting: false, role: 'group' });

      expect(attribute(titleRow, 'role')).toBe('group');
    });
  });

  describe('hidden rows', () => {
    it('should leave the accessibility tree while hidden', () => {
      const item = new SettingsPanelItem({ label: 'Audio Quality' });

      item.hide();

      expect(attribute(item, 'aria-hidden')).toBe('true');
      expect(attribute(item, 'role')).toBe('none');
    });

    it('should return to the accessibility tree with its role when shown again', () => {
      const item = new SettingsPanelItem({ label: 'Audio Quality' });
      item.hide();

      item.show();

      expect(attribute(item, 'aria-hidden')).toBeNull();
      expect(attribute(item, 'role')).toBe('menuitem');
    });

    it('should leave the accessibility tree when it is configured as hidden', () => {
      const item = new SettingsPanelItem({ label: 'Saved Emissions', hidden: true });

      item.initialize();

      expect(attribute(item, 'aria-hidden')).toBe('true');
      expect(attribute(item, 'role')).toBe('none');
    });

    it('should restore the role a subclass configures', () => {
      const listSelector = new ListSelectorTestClass();
      const settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({})] });
      const item = new DynamicSettingsPanelItem({
        label: 'Speed',
        settingComponent: listSelector,
        container: settingsPanel,
      });
      item.hide();

      item.show();

      expect(attribute(item, 'role')).toBe('menuitem');
    });
  });

  describe('controls in title rows', () => {
    let settingsPanel: SettingsPanel<SettingsPanelConfig>;

    beforeEach(() => {
      settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({})] });
    });

    it.each`
      name                             | create
      ${'SettingsPanelPageBackButton'} | ${() => new SettingsPanelPageBackButton({ container: settingsPanel })}
      ${'SettingsPanelPageOpenButton'} | ${() => new SettingsPanelPageOpenButton({ container: settingsPanel })}
      ${'SubtitleSettingsResetButton'} | ${() => new SubtitleSettingsResetButton({})}
    `('should render $name as a menu item', ({ create }: { create: () => AnyComponent }) => {
      expect(attribute(create(), 'role')).toBe('menuitem');
    });
  });

  describe('DynamicSettingsPanelItem sub page', () => {
    let settingsPanel: SettingsPanel<SettingsPanelConfig>;
    let subPage: SettingsPanelPage;

    beforeEach(() => {
      const listSelector = new ListSelectorTestClass();
      listSelector.addItem('auto', 'Auto');
      listSelector.addItem('1080', '1080p');
      settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({})], pageTransitionAnimation: false });
      const item = new DynamicSettingsPanelItem({
        label: 'Video Quality',
        settingComponent: listSelector,
        container: settingsPanel,
      });
      settingsPanel.getRootPage().addComponent(item);
      settingsPanel.configure(playerMock, uiInstanceManagerMock);
      item.configure(playerMock, uiInstanceManagerMock);

      item.displayItemsSubPage();
      subPage = settingsPanel.getActivePage();
    });

    it('should not expose the title row as a menu item', () => {
      const titleRow = subPage.getComponents()[0];

      expect(attribute(titleRow, 'role')).toBe('none');
    });

    it('should name the menu after the visible title of its back button, not after the back button itself', () => {
      const titleRow = subPage.getComponents()[0] as SettingsPanelItem<never>;
      const backButton = titleRow.getComponents()[0];
      const backButtonElement = backButton.getDomElement().get(0);
      const labelledBy = attribute(subPage, 'aria-labelledby');
      const nameElement = Array.from(backButtonElement.children).find(child => child.id === labelledBy);

      expect(backButton).toBeInstanceOf(SettingsPanelPageBackButton);
      expect(attribute(backButton, 'role')).toBe('menuitem');
      // The accessible name of the back button may say more than its title, e.g. that it navigates back, which must
      // not become the name of the menu
      expect(labelledBy).not.toBe(backButton.getConfig().id);
      expect(nameElement?.textContent).toBe('Video Quality');
    });

    it('should not announce the options as opening another menu', () => {
      const options = subPage.getComponents().slice(1);

      expect(options.map(option => attribute(option, 'role'))).toEqual(['menuitemradio', 'menuitemradio']);
      expect(options.map(option => attribute(option, 'aria-haspopup'))).toEqual([null, null]);
    });

    it('should still announce that the item on the parent page opens a menu', () => {
      const item = settingsPanel.getRootPage().getComponents()[0];

      expect(attribute(item, 'aria-haspopup')).toBe('true');
    });
  });

  describe('ListBox', () => {
    it('should name the menu after its title and not expose the title as a menu item', () => {
      const listSelector = new ListSelectorTestClass();
      listSelector.addItem('en', 'English');
      listSelector.addItem('de', 'German');
      const listBox = new ListBox({ listSelector, title: 'Subtitles' });
      listBox.configure(playerMock, uiInstanceManagerMock);

      const page = listBox.getRootPage();
      const titleRow = page.getComponents()[0] as SettingsPanelItem<never>;
      const titleLabel = titleRow.getComponents()[0];

      expect(titleLabel).toBeInstanceOf(Label);
      expect(attribute(titleRow, 'role')).toBe('none');
      expect(attribute(page, 'aria-labelledby')).toBe(titleLabel.getConfig().id);
    });
  });

  describe('SettingsToggleButton', () => {
    it('should name the root menu after the button that opens it', () => {
      const settingsPanel = new SettingsPanel({ components: [new SettingsPanelPage({})], hidden: true });
      const button = new SettingsToggleButton({ settingsPanel });

      button.configure(playerMock, uiInstanceManagerMock);

      expect(attribute(settingsPanel.getRootPage(), 'aria-labelledby')).toBe(button.getConfig().id);
    });

    it('should keep a name the root menu already has', () => {
      const settingsPanel = new SettingsPanel({
        components: [new SettingsPanelPage({ ariaLabel: 'Subtitles' })],
        hidden: true,
      });
      const button = new SettingsToggleButton({ settingsPanel });

      button.configure(playerMock, uiInstanceManagerMock);

      expect(attribute(settingsPanel.getRootPage(), 'aria-labelledby')).toBeNull();
    });
  });

  describe('context menu', () => {
    it('should leave the menu role to its page, so menus are not nested', () => {
      const page = new SettingsPanelPage({});
      const contextMenu = new ContextMenu({ components: [page] });

      expect(attribute(contextMenu, 'role')).toBeNull();
      expect(attribute(page, 'role')).toBe('menu');
    });

    it('should name the player context menu', () => {
      const contextMenu = new PlayerContextMenu({ playerInsightsPanel: new PlayerInsightsPanel() });
      const page = contextMenu.getRootPage();

      expect(attribute(page, 'role')).toBe('menu');
      expect(attribute(page, 'aria-label')).toBe('Bitmovin Player');
    });
  });

  function attribute(component: AnyComponent, name: string): string | null {
    return component.getDomElement().get(0).getAttribute(name);
  }
});

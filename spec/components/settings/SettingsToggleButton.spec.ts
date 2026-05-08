import { DOM } from '../../../src/ts/DOM';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { SettingsToggleButton } from '../../../src/ts/components/settings/SettingsToggleButton';
import { MockHelper } from '../../helper/MockHelper';

describe('SettingsToggleButton', () => {
  describe('ARIA wiring', () => {
    let panel: SettingsPanel<SettingsPanelConfig>;
    let attrSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on DOM.attr *before* constructing the button so we capture the calls
      // emitted from the constructor. DOM is auto-mocked via the MockHelper, so its
      // prototype methods are jest spies/stubs that we can query.
      attrSpy = jest.spyOn(DOM.prototype, 'attr');
      panel = new SettingsPanel({ components: [new SettingsPanelPage({})], hidden: true });
    });

    afterEach(() => {
      attrSpy.mockRestore();
    });

    it('does not configure the invalid `pop-up button` role', () => {
      const button = new SettingsToggleButton({ settingsPanel: panel });
      // Inherits the valid native button role from the Button base class instead of the
      // previously-used invalid "pop-up button" string.
      expect(button.getConfig().role).toBe('button');
    });

    it('sets aria-haspopup, aria-controls, aria-owns, and aria-expanded on the DOM element', () => {
      new SettingsToggleButton({ settingsPanel: panel });
      const calls = attrSpy.mock.calls.map(([name, value]: [string, string]) => `${name}=${value}`);
      const panelId = panel.getActivePage().getConfig().id;
      expect(calls).toEqual(
        expect.arrayContaining([
          'aria-haspopup=menu',
          `aria-controls=${panelId}`,
          `aria-owns=${panelId}`,
          'aria-expanded=false',
        ]),
      );
    });

    it('flips aria-expanded when the panel show / hide events fire', () => {
      const button = new SettingsToggleButton({ settingsPanel: panel });
      const playerMock = MockHelper.getPlayerMock();
      const uiManagerMock = MockHelper.getUiInstanceManagerMock();
      panel.configure(playerMock, uiManagerMock);
      button.configure(playerMock, uiManagerMock);

      attrSpy.mockClear();

      (panel['componentEvents'].onShow as { dispatch: (s: unknown) => void }).dispatch(panel);
      expect(attrSpy).toHaveBeenCalledWith('aria-expanded', 'true');

      (panel['componentEvents'].onHide as { dispatch: (s: unknown) => void }).dispatch(panel);
      expect(attrSpy).toHaveBeenCalledWith('aria-expanded', 'false');
    });
  });
});

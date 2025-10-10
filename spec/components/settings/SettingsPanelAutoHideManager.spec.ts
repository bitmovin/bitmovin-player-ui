import { SettingsPanelAutoHideManager } from '../../../src/ts/components/settings/SettingsPanelAutoHideManager';
import { SettingsPanel } from '../../../src/ts/components/settings/SettingsPanel';
import type { SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';

type PanelSetupOptions = {
  hideDelay?: number;
  scrollTop?: number;
  wrapperScrollTop?: number;
  panelWidth?: number;
  panelHeight?: number;
  navigationStack?: unknown[];
  activePage?: unknown;
};

const createSettingsPanelInstance = (options: PanelSetupOptions = {}) => {
  const {
    hideDelay,
    scrollTop = 12,
    wrapperScrollTop = 8,
    panelWidth = 320,
    panelHeight = 180,
    navigationStack = [],
    activePage = { id: 'settings-page' },
  } = options;

  const panel = new SettingsPanel({
    components: [new SettingsPanelPage({})],
    hidden: false,
    hideDelay,
  } as SettingsPanelConfig);

  const domElement = panel.getDomElement();
  const element = domElement.get(0) as HTMLElement;
  const wrapper = (element.lastElementChild ?? element.firstElementChild) as HTMLElement;

  element.scrollTop = scrollTop;
  Object.defineProperty(element, 'scrollWidth', { value: panelWidth, configurable: true });
  Object.defineProperty(element, 'scrollHeight', { value: panelHeight, configurable: true });

  if (wrapper) {
    wrapper.className = 'bmpui-container-wrapper';
    wrapper.scrollTop = wrapperScrollTop;
  }

  (panel as any).innerContainerElement = {
    get: (index: number) => wrapper,
  };

  jest.spyOn(panel as any, 'wrapperScrollTop', 'get').mockReturnValue(wrapperScrollTop);

  const panelNavigationStack =
    navigationStack.length > 0
      ? [...navigationStack]
      : [panel.getActivePage(), new SettingsPanelPage({})];
  (panel as any).navigationStack = panelNavigationStack;

  if (activePage) {
    jest.spyOn(panel, 'getActivePage').mockReturnValue(activePage as any);
  }

  return {
    panel: panel as SettingsPanel<SettingsPanelConfig>,
    element,
    wrapper,
    navigationStack: panelNavigationStack,
    activePage: panel.getActivePage(),
  };
};

describe('SettingsPanelAutoHideManager', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getOpenSettingsPanelHideDelay', () => {
    it('returns undefined when no settings panel is open', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1000 });

      expect(manager.getOpenSettingsPanelHideDelay()).toBeUndefined();
    });

    it('returns the hide delay of the first open panel', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1000 });
      const { panel } = createSettingsPanelInstance({ hideDelay: 4000 });

      manager.onSettingsPanelShow(panel);

      expect(manager.getOpenSettingsPanelHideDelay()).toBe(4000);
    });

    it('ignores negative hide delays', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1000 });
      const { panel } = createSettingsPanelInstance({ hideDelay: -1 });

      manager.onSettingsPanelShow(panel);

      expect(manager.getOpenSettingsPanelHideDelay()).toBeUndefined();
    });
  });

  describe('state persistence', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
    });

    it('restores saved panel state when reopened before the clear timeout', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1000 });
      const { panel, element, wrapper, navigationStack, activePage } = createSettingsPanelInstance({ hideDelay: 3000 });
      const showSpy = jest.spyOn(panel, 'show').mockImplementation(function(this: any) {
        // Call the original show method to trigger the event chain (onShow -> onAfterShow)
        return SettingsPanel.prototype.show.call(this);
      });
      const restoreNavigationStateSpy = jest.spyOn(panel, 'restoreNavigationState').mockImplementation(() => {});

      manager.onSettingsPanelShow(panel);
      manager.saveCurrentState();
      manager.onSettingsPanelHide(panel);

      // Actually hide the panel so that show() will trigger the event chain
      panel.hide();

      manager.restoreLastState();
      jest.runOnlyPendingTimers();

      expect(showSpy).toHaveBeenCalledTimes(1);
      expect(restoreNavigationStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activePage,
          navigationStack,
          scrollTop: element.scrollTop,
          wrapperScrollTop: wrapper.scrollTop,
          panelWidth: element.scrollWidth,
          panelHeight: element.scrollHeight,
        }),
      );

      // Prove the manager clears its saved state and doesn't reopen the panel again

      showSpy.mockClear();
      restoreNavigationStateSpy.mockClear();
      manager.restoreLastState();

      expect(showSpy).not.toHaveBeenCalled();
      expect(restoreNavigationStateSpy).not.toHaveBeenCalled();
    });

    it('clears saved state after the configured delay', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1500 });
      const { panel } = createSettingsPanelInstance();
      const showSpy = jest.spyOn(panel, 'show');
      const restoreNavigationStateSpy = jest.spyOn(panel, 'restoreNavigationState').mockImplementation(() => {});

      manager.onSettingsPanelShow(panel);
      manager.saveCurrentState();
      manager.onSettingsPanelHide(panel);

      jest.advanceTimersByTime(1500);
      jest.runOnlyPendingTimers();

      manager.restoreLastState();
      jest.runOnlyPendingTimers();

      expect(showSpy).not.toHaveBeenCalled();
      expect(restoreNavigationStateSpy).not.toHaveBeenCalled();
    });
  });
});

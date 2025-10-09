import { DOM } from '../../../src/ts/DOM';
import { SettingsPanelAutoHideManager } from '../../../src/ts/components/settings/SettingsPanelAutoHideManager';
import type { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';

const CONTAINER_WRAPPER_CLASS = 'ui-container-wrapper';

type PanelStubOptions = {
  hideDelay?: number;
  scrollTop?: number;
  wrapperScrollTop?: number;
  panelWidth?: number;
  panelHeight?: number;
  navigationStack?: unknown[];
  activePage?: unknown;
};

const createSettingsPanelStub = (options: PanelStubOptions = {}) => {
  const {
    hideDelay,
    scrollTop = 12,
    wrapperScrollTop = 8,
    panelWidth = 320,
    panelHeight = 180,
    navigationStack = ['root', 'child'],
    activePage = { id: 'settings-page' },
  } = options;

  const element = document.createElement('div');
  element.scrollTop = scrollTop;
  Object.defineProperty(element, 'scrollWidth', { value: panelWidth });
  Object.defineProperty(element, 'scrollHeight', { value: panelHeight });

  const wrapper = document.createElement('div');
  wrapper.className = CONTAINER_WRAPPER_CLASS;
  wrapper.scrollTop = wrapperScrollTop;
  element.appendChild(wrapper);

  const domElement = new DOM(element);

  const show = jest.fn();
  const restoreNavigationState = jest.fn();

  const panelNavigationStack = [...navigationStack];

  const panel = {
    getConfig: jest.fn().mockReturnValue(({ hideDelay } as unknown) as SettingsPanelConfig),
    getDomElement: jest.fn().mockReturnValue(domElement),
    getWrapperClassName: jest.fn().mockReturnValue(CONTAINER_WRAPPER_CLASS),
    getActivePage: jest.fn().mockReturnValue(activePage),
    show,
    restoreNavigationState,
    navigationStack: panelNavigationStack,
  } as unknown as SettingsPanel<SettingsPanelConfig> & { navigationStack: unknown[] };

  return { panel, element, wrapper, show, restoreNavigationState, navigationStack: panelNavigationStack, activePage };
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
      const { panel } = createSettingsPanelStub({ hideDelay: 4000 });

      manager.onSettingsPanelShow(panel);

      expect(manager.getOpenSettingsPanelHideDelay()).toBe(4000);
    });

    it('ignores negative hide delays', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1000 });
      const { panel } = createSettingsPanelStub({ hideDelay: -1 });

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
      const { panel, element, wrapper, show, restoreNavigationState, navigationStack, activePage } =
        createSettingsPanelStub({ hideDelay: 3000 });

      manager.onSettingsPanelShow(panel);
      manager.saveCurrentState();
      manager.onSettingsPanelHide(panel);

      manager.restoreLastState();
      jest.runOnlyPendingTimers();

      expect(show).toHaveBeenCalledTimes(1);
      expect(restoreNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          activePage,
          navigationStack,
          scrollTop: element.scrollTop,
          wrapperScrollTop: wrapper.scrollTop,
          panelWidth: element.scrollWidth,
          panelHeight: element.scrollHeight,
        }),
      );

      show.mockClear();
      restoreNavigationState.mockClear();
      manager.restoreLastState();

      expect(show).not.toHaveBeenCalled();
      expect(restoreNavigationState).not.toHaveBeenCalled();
    });

    it('clears saved state after the configured delay', () => {
      const manager = new SettingsPanelAutoHideManager({ stateClearDelay: 1500 });
      const { panel, show, restoreNavigationState } = createSettingsPanelStub();

      manager.onSettingsPanelShow(panel);
      manager.saveCurrentState();
      manager.onSettingsPanelHide(panel);

      jest.advanceTimersByTime(1500);
      jest.runOnlyPendingTimers();

      manager.restoreLastState();
      jest.runOnlyPendingTimers();

      expect(show).not.toHaveBeenCalled();
      expect(restoreNavigationState).not.toHaveBeenCalled();
    });
  });
});

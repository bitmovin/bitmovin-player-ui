import type { PlayerAPI } from 'bitmovin-player';

import type { Component, ComponentConfig, ViewModeChangedEventArgs } from '../../../src/ts/components/Component';
import { ViewMode } from '../../../src/ts/components/Component';
import { SettingsPanel, SettingsPanelConfig } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { EventDispatcher } from '../../../src/ts/EventDispatcher';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper } from '../../helper/MockHelper';
import getPlayerMock = MockHelper.getPlayerMock;
import getUiInstanceManagerMock = MockHelper.getUiInstanceManagerMock;
import { Label } from '../../../src/ts/components/labels/Label';
import { SelectBox } from '../../../src/ts/components/settings/SelectBox';
import { SettingsPanelItem } from '../../../src/ts/components/settings/SettingsPanelItem';
import { VolumeSlider } from '../../../src/ts/components/seekbar/VolumeSlider';

let settingsPanel: SettingsPanel<SettingsPanelConfig>;

describe('SettingsPanel', () => {
  describe('page navigation', () => {
    let playerMock: PlayerAPI;
    let rootPage: SettingsPanelPage;
    let firstPage: SettingsPanelPage;
    let secondPage: SettingsPanelPage;
    let uiInstanceManagerMock: UIInstanceManager;

    beforeEach(() => {
      playerMock = getPlayerMock();
      rootPage = new SettingsPanelPage({});
      firstPage = new SettingsPanelPage({});
      secondPage = new SettingsPanelPage({});
      settingsPanel = new SettingsPanel({ components: [rootPage, firstPage, secondPage] });
      uiInstanceManagerMock = getUiInstanceManagerMock();
      Object.defineProperty(uiInstanceManagerMock, 'onComponentViewModeChanged', {
        value: new EventDispatcher<Component<ComponentConfig>, ViewModeChangedEventArgs>(),
      });
      settingsPanel.configure(playerMock, uiInstanceManagerMock);
    });

    describe('popSettingsPanelPage', () => {
      it('pops from third page pack to root page one after popping two times', () => {
        // Navigates to levels
        settingsPanel.setActivePage(firstPage);
        settingsPanel.setActivePage(secondPage);

        // Popping to levels back again
        settingsPanel.popSettingsPanelPage();
        settingsPanel.popSettingsPanelPage();

        // Expect to be back at the root page
        expect(settingsPanel.getActivePage()).toBe(rootPage);
      });

      it('navigates back one level', () => {
        settingsPanel.setActivePage(firstPage);
        settingsPanel.setActivePage(secondPage);

        // Popping to levels back again
        settingsPanel.popSettingsPanelPage();

        expect(settingsPanel.getActivePage()).toBe(firstPage);
      });
    });

    describe('getActivePage', () => {
      it('returns the root page if no navigation happened', () => {
        expect(settingsPanel.getActivePage()).toBe(rootPage);
      });
    });

    describe('setActivePageIndex', () => {
      it('returns the page at index', () => {
        settingsPanel.setActivePageIndex(1);
        expect(settingsPanel.getActivePage()).toBe(firstPage);
      });

      it("doesn't push the current page again", () => {
        settingsPanel.setActivePageIndex(1);
        settingsPanel.setActivePageIndex(1);

        // Not testable with public methods
        expect((settingsPanel as any).navigationStack.length).toEqual(1);
        expect(settingsPanel.getActivePage()).toEqual(firstPage);
      });
    });

    describe('setActivePage', () => {
      it('returns the set page', () => {
        settingsPanel.setActivePage(secondPage);
        expect(settingsPanel.getActivePage()).toBe(secondPage);
      });

      it("doesn't push the current page again", () => {
        settingsPanel.setActivePage(secondPage);
        settingsPanel.setActivePage(secondPage);

        // Not testable with public methods
        expect((settingsPanel as any).navigationStack.length).toEqual(1);
        expect(settingsPanel.getActivePage()).toBe(secondPage);
      });
    });

    describe('popToRootSettingsPanelPage', () => {
      it('navigates back to the root page', () => {
        settingsPanel.setActivePage(secondPage);
        settingsPanel.setActivePage(firstPage);

        settingsPanel.popToRootSettingsPanelPage();
        expect(settingsPanel.getActivePage()).toBe(rootPage);
      });
    });

    it('restores the last active page when the panel opens again', () => {
      settingsPanel.setActivePage(firstPage);
      settingsPanel.setActivePage(secondPage);

      // Fake hide event to persist the state
      (settingsPanel as any).componentEvents.onHide.dispatch(settingsPanel);

      // Fake show event should restore the previous state
      (settingsPanel as any).componentEvents.onShow.dispatch(settingsPanel);
      expect(settingsPanel.getActivePage()).toBe(secondPage);
    });

    describe('onInactiveEvent', () => {
      it('fires for root page when we navigate to second page', () => {
        const spy = jest.fn();
        rootPage.onInactive.subscribe(spy);

        settingsPanel.setActivePage(secondPage);
        expect(spy).toHaveBeenCalled();
      });

      it('fires for second page when we navigate back', () => {
        const spy = jest.fn();
        secondPage.onInactive.subscribe(spy);

        settingsPanel.setActivePage(secondPage);
        settingsPanel.popSettingsPanelPage();
        expect(spy).toHaveBeenCalled();
      });

      it('fires for current page if the settings panel hides', () => {
        const spy = jest.fn();
        secondPage.onInactive.subscribe(spy);

        settingsPanel.setActivePage(secondPage);
        // Fake hide event
        (settingsPanel as any).componentEvents.onHide.dispatch(settingsPanel);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('onActiveEvent', () => {
      it('fires for second page when we navigate to it', () => {
        const spy = jest.fn();
        secondPage.onActive.subscribe(spy);

        settingsPanel.setActivePage(secondPage);
        expect(spy).toHaveBeenCalled();
      });

      it('fires for root page when the settings panel gets visible', () => {
        const spy = jest.fn();
        rootPage.onActive.subscribe(spy);

        // Fake show event
        (settingsPanel as any).componentEvents.onShow.dispatch(settingsPanel);
        expect(spy).toHaveBeenCalled();
      });

      it('fires for the previously active page when the settings panel becomes visible again', () => {
        const rootSpy = jest.fn();
        const secondPageSpy = jest.fn();
        rootPage.onActive.subscribe(rootSpy);
        secondPage.onActive.subscribe(secondPageSpy);

        settingsPanel.setActivePage(secondPage);
        // Fake hide event
        (settingsPanel as any).componentEvents.onHide.dispatch(settingsPanel);

        // Fake show event
        (settingsPanel as any).componentEvents.onShow.dispatch(settingsPanel);
        expect(secondPageSpy).toHaveBeenCalled();
        expect(rootSpy).not.toHaveBeenCalled();
      });
    });

    describe('configure', () => {
      it('should subscribe to the onComponentViewModeChanged event', () => {
        const subscribeSpy = jest.spyOn(uiInstanceManagerMock.onComponentViewModeChanged, 'subscribe');

        settingsPanel.configure(playerMock, uiInstanceManagerMock);

        expect(subscribeSpy).toHaveBeenCalled();
      });
    });

    describe('onComponentViewModeChanged', () => {
      it('should suspend the hide timeout when a component enters the persistent view mode', () => {
        const suspendTimeoutSpy = jest.spyOn(settingsPanel['hideTimeout'], 'suspend');

        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Persistent });

        expect(suspendTimeoutSpy).toHaveBeenCalled();
      });

      it('should resume the hide timeout when the last component left the persistent view mode', () => {
        const resumeTimeoutSpy = jest.spyOn(settingsPanel['hideTimeout'], 'resume');

        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Persistent });
        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Persistent });
        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Persistent });

        expect(resumeTimeoutSpy).not.toHaveBeenCalled();

        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Temporary });
        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Temporary });

        expect(resumeTimeoutSpy).not.toHaveBeenCalled();

        uiInstanceManagerMock.onComponentViewModeChanged.dispatch(undefined, { mode: ViewMode.Temporary });

        expect(resumeTimeoutSpy).toHaveBeenCalled();
      });
    });

    describe('hideHoveredSelectBoxes', () => {
      it('should close the dropdown on the select box', () => {
        const selectBox = new SelectBox();
        const closeDropdownSpy = jest.spyOn(selectBox, 'closeDropdown');

        settingsPanel
          .getActivePage()
          .addComponent(new SettingsPanelItem({ label: new Label(), settingComponent: selectBox }));
        settingsPanel
          .getActivePage()
          .addComponent(new SettingsPanelItem({ label: new Label(), settingComponent: new VolumeSlider() }));

        settingsPanel['hideHoveredSelectBoxes']();

        expect(closeDropdownSpy).toHaveBeenCalled();
      });
    });
  });
});

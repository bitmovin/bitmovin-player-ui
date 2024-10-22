import type { PlayerAPI } from 'bitmovin-player';

import type { Component, ViewModeChangedEventArgs } from '../../src/ts/components/component';
import { ViewMode } from '../../src/ts/components/component';
import type { ListSelectorConfig } from '../../src/ts/components/listselector';
import { SelectBox } from '../../src/ts/components/selectbox';
import type { Event } from '../../src/ts/eventdispatcher';
import { PlayerUtils } from '../../src/ts/playerutils';
import type { UIInstanceManager } from '../../src/ts/uimanager';
import { MockHelper } from '../helper/MockHelper';
import getUiInstanceManagerMock = MockHelper.getUiInstanceManagerMock;
import getPlayerMock = MockHelper.getPlayerMock;
import generateDOMMock = MockHelper.generateDOMMock;
import PlayerState = PlayerUtils.PlayerState;
import type { DOM } from '../../src/ts/dom';

jest.mock('../../src/ts/dom', generateDOMMock);

describe('SelectBox', () => {
  let selectBox: SelectBox;
  let playerMock: PlayerAPI;
  let uiManagerMock: UIInstanceManager;

  beforeEach(() => {
    selectBox = new SelectBox();
    playerMock = getPlayerMock();
    uiManagerMock = getUiInstanceManagerMock();
  });

  describe('viewMode', () => {
    it('should initialize the `ViewMode` to `Temporary`', () => {
      expect(selectBox['viewMode']).toEqual(ViewMode.Temporary);
    });
  });

  describe('configure', () => {
    test.each`
      event
      ${'onShow'}
      ${'onHide'}
      ${'onViewModeChanged'}
    `('should subscribe to "$event"', ({ event }) => {
      const subscribeSpy = jest.spyOn(selectBox[event as keyof SelectBox] as Event<unknown, unknown>, 'subscribe');

      selectBox.configure(playerMock, uiManagerMock);

      expect(subscribeSpy).toHaveBeenCalled();
    });

    test.each`
      event
      ${'mouseenter'}
      ${'mouseleave'}
    `('should add a "$event" listener to the DOM element', ({ event }) => {
      const onSpy = jest.spyOn(selectBox.getDomElement(), 'on');

      selectBox.configure(playerMock, uiManagerMock);

      expect(onSpy).toHaveBeenCalledWith(event, expect.any(Function));
    });
  });

  describe('onViewModeChangedEvent', () => {
    let viewModeChangedSpy: jest.Mock<void, [Component<ListSelectorConfig>, ViewModeChangedEventArgs]>;

    beforeEach(() => {
      viewModeChangedSpy = jest.fn();
      selectBox.onViewModeChanged.subscribe(viewModeChangedSpy);
    });

    it('should dispatch the onViewModeChanged event', () => {
      selectBox['onViewModeChangedEvent'](ViewMode.Persistent);

      expect(viewModeChangedSpy).toHaveBeenCalledWith(expect.any(SelectBox), { mode: ViewMode.Persistent });
    });

    it('should not dispatch the onViewModeChanged event if the view mode did not change', () => {
      selectBox['onViewModeChangedEvent'](ViewMode.Temporary);

      expect(viewModeChangedSpy).not.toHaveBeenCalled();
    });
  });

  describe('toDomElement', () => {
    test.each`
      event
      ${'onDisabled'}
      ${'onHide'}
    `('should subscribe to "$event" to close the dropdown', ({ event }) => {
      const subscribeSpy = jest.spyOn(selectBox[event as keyof SelectBox] as Event<unknown, unknown>, 'subscribe');

      selectBox.getDomElement();

      expect(subscribeSpy).toHaveBeenCalledWith(selectBox.closeDropdown);
    });

    it('should add event dropdown open event listeners', () => {
      const domElement = selectBox.getDomElement();

      expect(domElement.on).toHaveBeenCalled();
    });
  });

  describe('configure', () => {
    it('should subscribe to player state changes', () => {
      const uiContainer = uiManagerMock.getUI();

      selectBox.configure(playerMock, uiManagerMock);

      expect(uiContainer.onPlayerStateChange().subscribe).toHaveBeenCalledWith(selectBox['onPlayerStateChange']);
    });
  });

  describe('closeDropdown', () => {
    it('should call blur on the DOM select element', () => {
      const element = document.createElement('select');
      const blurSpy = jest.spyOn(element, 'blur');

      jest.spyOn(selectBox as any, 'getSelectElement').mockReturnValue(element);
      selectBox.closeDropdown();

      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('onPlayerStateChange', () => {
    test.each`
      playerState             | shouldClose
      ${PlayerState.Idle}     | ${true}
      ${PlayerState.Finished} | ${true}
      ${PlayerState.Paused}   | ${false}
      ${PlayerState.Playing}  | ${false}
      ${PlayerState.Prepared} | ${false}
    `(
      `should close the dropdown=$shouldClose when the player state changes to $playerState`,
      ({ playerState, shouldClose }) => {
        const closeDropdownSpy = jest.spyOn(selectBox, 'closeDropdown');

        selectBox['onPlayerStateChange'](uiManagerMock.getUI(), playerState);

        if (shouldClose) {
          expect(closeDropdownSpy).toHaveBeenCalled();
        } else {
          expect(closeDropdownSpy).not.toHaveBeenCalled();
        }
      },
    );
  });

  describe('onDropdownOpened', () => {
    it('should clear the existing closed event listener addition timeout', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      selectBox['onDropdownOpened']();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should start a timeout to add closed event listeners', () => {
      const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

      selectBox['onDropdownOpened']();

      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('should change the view mode to `Persistent`', () => {
      const onViewModeChangedSpy = jest.fn();

      selectBox.onViewModeChanged.subscribe(onViewModeChangedSpy);
      selectBox['onDropdownOpened']();

      expect(onViewModeChangedSpy).toHaveBeenCalledWith(expect.any(SelectBox), { mode: ViewMode.Persistent });
    });
  });

  describe('onDropdownClosed', () => {
    it('should clear the closed event listener addition timeout', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      selectBox['onDropdownClosed']();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should remove the close event listeners', () => {
      const removeDropdownCloseListenersSpy = jest.fn();

      selectBox['removeDropdownCloseListeners'] = removeDropdownCloseListenersSpy;
      selectBox['onDropdownClosed']();

      expect(removeDropdownCloseListenersSpy).toHaveBeenCalled();
    });

    it('should change the view mode to `Temporary`', () => {
      const onViewModeChangedSpy = jest.fn();

      selectBox['viewMode'] = ViewMode.Persistent;
      selectBox.onViewModeChanged.subscribe(onViewModeChangedSpy);
      selectBox['onDropdownClosed']();

      expect(onViewModeChangedSpy).toHaveBeenCalledWith(expect.any(SelectBox), { mode: ViewMode.Temporary });
    });
  });

  describe('addDropdownCloseListeners', () => {
    let selectElement: DOM;

    beforeEach(() => {
      selectElement = { on: jest.fn(), off: jest.fn() } as unknown as DOM;
      selectBox['selectElement'] = selectElement;
    });

    it('should remove existing close listeners', () => {
      const removeDropdownCloseListenersSpy = jest.fn();

      selectBox['removeDropdownCloseListeners'] = removeDropdownCloseListenersSpy;
      selectBox['addDropdownCloseListeners']();

      expect(removeDropdownCloseListenersSpy).toHaveBeenCalled();
    });

    it('should clear the closed event listener addition timeout', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      selectBox['addDropdownCloseListeners']();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should add close event listeners to the document', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      selectBox['addDropdownCloseListeners']();

      expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it('should add close event listeners to the select element', () => {
      selectBox['addDropdownCloseListeners']();

      expect(selectElement.on).toHaveBeenCalled();
    });

    it('should set the removeDropdownCloseListeners', () => {
      const initialRemoveDropdownCloseListenersFunction = selectBox['removeDropdownCloseListeners'];

      selectBox['addDropdownCloseListeners']();

      const newRemoveDropdownCloseListenersFunction = selectBox['removeDropdownCloseListeners'];

      expect(initialRemoveDropdownCloseListenersFunction).not.toEqual(newRemoveDropdownCloseListenersFunction);
    });
  });

  describe('removeDropdownCloseListeners', () => {
    let selectElement: DOM;

    beforeEach(() => {
      selectElement = { on: jest.fn(), off: jest.fn() } as unknown as DOM;
      selectBox['selectElement'] = selectElement;
      selectBox['addDropdownCloseListeners']();
    });

    it('should remove close event listeners to the document', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      selectBox['removeDropdownCloseListeners']();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should remove close event listeners from the select element', () => {
      selectBox['removeDropdownCloseListeners']();

      expect(selectElement.off).toHaveBeenCalled();
    });
  });

  describe('addDropdownOpenedListeners', () => {
    let selectElement: DOM;

    beforeEach(() => {
      selectElement = { on: jest.fn(), off: jest.fn() } as unknown as DOM;
      selectBox['selectElement'] = selectElement;
    });

    it('should remove existing open listeners', () => {
      const removeDropdownOpenedListenersSpy = jest.fn();

      selectBox['removeDropdownOpenedListeners'] = removeDropdownOpenedListenersSpy;
      selectBox['addDropdownOpenedListeners']();

      expect(removeDropdownOpenedListenersSpy).toHaveBeenCalled();
    });

    it('should add event listener on the select element', () => {
      selectBox['addDropdownOpenedListeners']();

      expect(selectElement.on).toHaveBeenCalled();
    });

    it('should set the removeDropdownOpenedListeners', () => {
      const initialRemoveDropdownOpenedListenersFunction = selectBox['removeDropdownOpenedListeners'];

      selectBox['addDropdownOpenedListeners']();

      const newRemoveDropdownOpenedListenersFunction = selectBox['removeDropdownOpenedListeners'];

      expect(initialRemoveDropdownOpenedListenersFunction).not.toEqual(newRemoveDropdownOpenedListenersFunction);
    });
  });

  describe('removeDropdownOpenedListeners', () => {
    it('should remove opened event listeners from the select element', () => {
      const selectElement = { on: jest.fn(), off: jest.fn() } as unknown as DOM;
      selectBox['selectElement'] = selectElement;
      selectBox['addDropdownOpenedListeners']();

      selectBox['removeDropdownOpenedListeners']();

      expect(selectElement.off).toHaveBeenCalled();
    });
  });
});

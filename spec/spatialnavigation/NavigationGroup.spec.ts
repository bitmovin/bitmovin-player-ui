import { NavigationGroup } from '../../src/ts/spatialnavigation/NavigationGroup';
import { UIContainer } from '../../src/ts/components/UIContainer';
import { Container } from '../../src/ts/components/Container';
import { PlaybackToggleButton } from '../../src/ts/components/buttons/PlaybackToggleButton';
import { SettingsToggleButton } from '../../src/ts/components/settings/SettingsToggleButton';
import { getFirstDomElement, mockComponent } from '../helper/mockComponent';
import * as navigationAlgorithm from '../../src/ts/spatialnavigation/NavigationAlgorithm';
import { NodeEventSubscriber } from '../../src/ts/spatialnavigation/NodeEventSubscriber';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';
import * as toHtmlElementModule from '../../src/ts/spatialnavigation/helper/toHtmlElement';
import * as TypeGuards from '../../src/ts/spatialnavigation/TypeGuards';
import { FocusableContainer } from '../../src/ts/spatialnavigation/FocusableContainer';

jest.mock('../../src/ts/spatialnavigation/NavigationAlgorithm.ts');
jest.mock('../../src/ts/spatialnavigation/NodeEventSubscriber.ts');
jest.mock('../../src/ts/spatialnavigation/helper/toHtmlElement.ts');
jest.mock('../../src/ts/spatialnavigation/TypeGuards.ts');

describe('NavigationGroup', () => {
  let rootNavigationGroup: NavigationGroup;
  let rootContainerMock: jest.Mocked<UIContainer>;
  let playbackToggleButtonMock: jest.Mocked<PlaybackToggleButton>;
  let playbackToggleButtonHtmlMock: jest.Mocked<HTMLElement>;
  let subtitleToggleButtonMock: jest.Mocked<SettingsToggleButton>;

  beforeEach(() => {
    jest.spyOn(TypeGuards, 'isFocusable').mockReturnValue(true);
    jest.spyOn(TypeGuards, 'isComponent').mockReturnValue(true);
    jest.spyOn(TypeGuards, 'isContainer').mockReturnValue(false);
    jest.spyOn(TypeGuards, 'isSettingsPanel').mockReturnValue(false);

    rootContainerMock = mockComponent(UIContainer);
    playbackToggleButtonMock = mockComponent(PlaybackToggleButton);
    playbackToggleButtonHtmlMock = getFirstDomElement(playbackToggleButtonMock);
    jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
      if (component === playbackToggleButtonMock) {
        return playbackToggleButtonHtmlMock;
      }
      return undefined;
    });

    subtitleToggleButtonMock = mockComponent(SettingsToggleButton);

    rootNavigationGroup = new NavigationGroup(rootContainerMock, playbackToggleButtonMock, subtitleToggleButtonMock);
  });

  describe('getActiveComponent', () => {
    it('should return active component', () => {
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;

      expect(rootNavigationGroup.getActiveComponent()).toEqual(playbackToggleButtonMock);
    });
  });

  describe('enable', () => {
    it('should focus first element if there is no previous element, and not settings panel', () => {
      rootNavigationGroup['activeComponentBeforeDisable'] = undefined;
      rootNavigationGroup.enable();

      expect(playbackToggleButtonHtmlMock.focus).toHaveBeenCalled();
    });

    it('should focus last activeComponentBeforeDisable if not settings panel', () => {
      rootNavigationGroup['activeComponentBeforeDisable'] = playbackToggleButtonMock;

      rootNavigationGroup.enable();
      expect(playbackToggleButtonHtmlMock.focus).toHaveBeenCalled();
    });

    it('should restore the last active component when a visible settings panel is temporarily disabled', () => {
      const subtitleToggleButtonHtmlMock = getFirstDomElement(subtitleToggleButtonMock);
      jest.spyOn(TypeGuards, 'isSettingsPanel').mockReturnValue(true);
      rootContainerMock.isShown.mockReturnValue(true);
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackToggleButtonHtmlMock;
        }
        if (component === subtitleToggleButtonMock) {
          return subtitleToggleButtonHtmlMock;
        }
        return undefined;
      });
      rootNavigationGroup['activeComponentBeforeDisable'] = subtitleToggleButtonMock;

      rootNavigationGroup.enable();

      expect(subtitleToggleButtonHtmlMock.focus).toHaveBeenCalled();
    });

    it('should clear the saved component when a settings panel is hidden before disable', () => {
      jest.spyOn(TypeGuards, 'isSettingsPanel').mockReturnValue(true);
      rootContainerMock.isShown.mockReturnValue(false);
      const subtitleToggleButtonHtmlMock = getFirstDomElement(subtitleToggleButtonMock);
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === subtitleToggleButtonMock) {
          return subtitleToggleButtonHtmlMock;
        }
        return playbackToggleButtonHtmlMock;
      });
      rootNavigationGroup['activeComponent'] = subtitleToggleButtonMock;

      rootNavigationGroup.disable();

      expect(rootNavigationGroup['activeComponentBeforeDisable']).toBeUndefined();
      rootNavigationGroup.enable();
      expect(playbackToggleButtonHtmlMock.focus).toHaveBeenCalled();
    });

    it('should clear the saved component when a settings panel is hidden while already disabled', () => {
      jest.spyOn(TypeGuards, 'isSettingsPanel').mockReturnValue(true);
      rootContainerMock.isShown.mockReturnValue(false);
      rootNavigationGroup['activeComponentBeforeDisable'] = subtitleToggleButtonMock;

      rootNavigationGroup.disable();

      expect(rootNavigationGroup['activeComponentBeforeDisable']).toBeUndefined();
    });
  });

  describe('disable', () => {
    it('should blur active element and save it as element before disable', () => {
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
      rootNavigationGroup.disable();

      expect(playbackToggleButtonHtmlMock.blur).toHaveBeenCalled();
      expect(rootNavigationGroup['activeComponentBeforeDisable']).toEqual(playbackToggleButtonMock);
    });
  });

  describe('handleNavigation', () => {
    let subtitleToggleButtonHTML: HTMLElement;

    beforeEach(() => {
      subtitleToggleButtonHTML = getFirstDomElement(subtitleToggleButtonMock);
      jest.spyOn(navigationAlgorithm, 'getComponentInDirection').mockReturnValueOnce(subtitleToggleButtonMock);
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackToggleButtonHtmlMock;
        }
        if (component === subtitleToggleButtonMock) {
          return subtitleToggleButtonHTML;
        }
        return undefined;
      });
    });

    it('should focus element found by algorithm', () => {
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
      rootNavigationGroup.handleNavigation(Direction.DOWN);

      expect(subtitleToggleButtonHTML.focus).toHaveBeenCalled();
    });

    it('should default to the last selected item when there is no active item', () => {
      rootNavigationGroup['activeComponentBeforeDisable'] = subtitleToggleButtonMock;
      rootNavigationGroup['activeComponent'] = undefined;

      rootNavigationGroup.handleNavigation(Direction.LEFT);

      expect(subtitleToggleButtonHTML.focus).toHaveBeenCalled();
    });

    it('should return false when there is no active or focusable component', () => {
      const emptyNavigationGroup = new NavigationGroup(rootContainerMock);

      expect(emptyNavigationGroup.handleNavigation(Direction.LEFT)).toBe(false);
    });

    it('should call afterNavigation with undefined and return false when no target is found', () => {
      const getComponentInDirectionMock = navigationAlgorithm.getComponentInDirection as jest.Mock;
      const afterNavigationMock = jest.fn();
      getComponentInDirectionMock.mockReset();
      getComponentInDirectionMock.mockReturnValue(undefined);
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
      rootNavigationGroup.afterNavigation = afterNavigationMock;

      expect(rootNavigationGroup.handleNavigation(Direction.DOWN)).toBe(false);
      expect(afterNavigationMock).toHaveBeenCalledTimes(1);
      expect(afterNavigationMock).toHaveBeenCalledWith(Direction.DOWN, undefined);
    });

    it('should call afterNavigation with the component found within the active focusable container', () => {
      const getComponentInDirectionMock = navigationAlgorithm.getComponentInDirection as jest.Mock;
      const bottomControlBarMock = mockComponent(Container);
      const afterNavigationMock = jest.fn();

      getComponentInDirectionMock.mockReset();
      getComponentInDirectionMock.mockReturnValueOnce(subtitleToggleButtonMock);
      bottomControlBarMock.getComponents.mockReturnValue([playbackToggleButtonMock, subtitleToggleButtonMock]);

      rootNavigationGroup = new NavigationGroup(
        rootContainerMock,
        new FocusableContainer(bottomControlBarMock, playbackToggleButtonMock),
      );
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
      rootNavigationGroup.afterNavigation = afterNavigationMock;

      expect(rootNavigationGroup.handleNavigation(Direction.RIGHT)).toBe(true);
      expect(afterNavigationMock).toHaveBeenCalledTimes(1);
      expect(afterNavigationMock).toHaveBeenCalledWith(Direction.RIGHT, subtitleToggleButtonMock);
    });

    it('should call afterNavigation with the primary component if the navigation target is a focusable container', () => {
      const getComponentInDirectionMock = navigationAlgorithm.getComponentInDirection as jest.Mock;
      const bottomControlBarMock = mockComponent(Container);
      const afterNavigationMock = jest.fn();

      bottomControlBarMock.getComponents.mockReturnValue([subtitleToggleButtonMock]);
      const focusableContainer = new FocusableContainer(bottomControlBarMock, subtitleToggleButtonMock);
      getComponentInDirectionMock.mockReset();
      getComponentInDirectionMock.mockReturnValueOnce(focusableContainer);

      rootNavigationGroup = new NavigationGroup(rootContainerMock, playbackToggleButtonMock, focusableContainer);
      rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
      rootNavigationGroup.afterNavigation = afterNavigationMock;

      expect(rootNavigationGroup.handleNavigation(Direction.DOWN)).toBe(true);
      expect(afterNavigationMock).toHaveBeenCalledTimes(1);
      expect(afterNavigationMock).toHaveBeenCalledWith(Direction.DOWN, subtitleToggleButtonMock);
    });

    describe('onNavigation', () => {
      it('should not call default navigation handler if propagation was stopped from the outside', () => {
        rootNavigationGroup.onNavigation = (_direction, _element, preventDefault) => {
          preventDefault();
          return true;
        };

        rootNavigationGroup.handleNavigation(Direction.DOWN);

        expect(subtitleToggleButtonHTML.focus).not.toHaveBeenCalled();
      });

      it('should return handled when the custom navigation handler consumes the event without preventing the default handler', () => {
        const getComponentInDirectionMock = navigationAlgorithm.getComponentInDirection as jest.Mock;
        getComponentInDirectionMock.mockReset();
        getComponentInDirectionMock.mockReturnValue(undefined);
        rootNavigationGroup['activeComponent'] = playbackToggleButtonMock;
        rootNavigationGroup.onNavigation = () => true;

        expect(rootNavigationGroup.handleNavigation(Direction.DOWN)).toBe(true);
      });
    });
  });

  describe('handleAction', () => {
    let playButtonHTML: HTMLElement;

    beforeEach(() => {
      playButtonHTML = getFirstDomElement(subtitleToggleButtonMock);
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackToggleButtonHtmlMock;
        }
        if (component === subtitleToggleButtonMock) {
          return playButtonHTML;
        }
        return undefined;
      });
      rootNavigationGroup['activeComponent'] = subtitleToggleButtonMock;
    });

    it('should click on active element when Action.ENTER is passed', () => {
      rootNavigationGroup.handleAction(Action.SELECT);

      expect(playButtonHTML.click).toHaveBeenCalled();
    });

    it('should call hide container when Action.BACK is passed', () => {
      rootNavigationGroup.handleAction(Action.BACK);

      expect(rootContainerMock.hide).toHaveBeenCalled();
    });

    describe('onAction', () => {
      it('should not call default action handler if propagation was stopped from the outside', () => {
        rootNavigationGroup.onAction = (_action, _element, preventDefault) => {
          preventDefault();
          return true;
        };
        rootNavigationGroup.handleAction(Action.SELECT);

        expect(playButtonHTML.click).not.toHaveBeenCalled();
      });
    });
  });

  describe('components that became unavailable', () => {
    let subtitleToggleButtonHtmlMock: HTMLElement;
    let subtitleFocusSpy: jest.SpyInstance;
    let subtitleClickSpy: jest.SpyInstance;
    let playbackFocusSpy: jest.SpyInstance;
    let playbackClickSpy: jest.SpyInstance;

    beforeEach(() => {
      subtitleToggleButtonHtmlMock = getFirstDomElement(subtitleToggleButtonMock);
      subtitleFocusSpy = jest.spyOn(subtitleToggleButtonHtmlMock, 'focus');
      subtitleClickSpy = jest.spyOn(subtitleToggleButtonHtmlMock, 'click');
      playbackFocusSpy = jest.spyOn(playbackToggleButtonHtmlMock, 'focus');
      playbackClickSpy = jest.spyOn(playbackToggleButtonHtmlMock, 'click');
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackToggleButtonHtmlMock;
        }
        if (component === subtitleToggleButtonMock) {
          return subtitleToggleButtonHtmlMock;
        }
        return undefined;
      });
      // The subtitle toggle stays remembered by the group, but can no longer take the focus
      jest.spyOn(TypeGuards, 'isFocusable').mockImplementation(component => component !== subtitleToggleButtonMock);
    });

    it('should not activate an unavailable active component on SELECT but focus the first available one', () => {
      rootNavigationGroup['activeComponent'] = subtitleToggleButtonMock;

      const handled = rootNavigationGroup.handleAction(Action.SELECT);

      expect(handled).toBe(true);
      expect(subtitleClickSpy).not.toHaveBeenCalled();
      expect(playbackClickSpy).not.toHaveBeenCalled();
      expect(playbackFocusSpy).toHaveBeenCalled();
      expect(rootNavigationGroup.getActiveComponent()).toBe(playbackToggleButtonMock);
    });

    it.each`
      restoredBy
      ${'enable'}
      ${'handleNavigation'}
    `(
      'should focus the first available component instead of an unavailable saved one on $restoredBy',
      ({ restoredBy }) => {
        rootNavigationGroup['activeComponentBeforeDisable'] = subtitleToggleButtonMock;
        rootNavigationGroup['activeComponent'] = undefined;

        if (restoredBy === 'enable') {
          rootNavigationGroup.enable();
        } else {
          rootNavigationGroup.handleNavigation(Direction.LEFT);
        }

        expect(subtitleFocusSpy).not.toHaveBeenCalled();
        expect(playbackFocusSpy).toHaveBeenCalled();
        expect(rootNavigationGroup.getActiveComponent()).toBe(playbackToggleButtonMock);
      },
    );
  });

  describe('focusable containers wrapping a component that became unavailable', () => {
    let wrappedOverlayMock: jest.Mocked<SettingsToggleButton>;
    let overlayAvailable: boolean;
    let overlayFocusSpy: jest.SpyInstance;
    let overlayClickSpy: jest.SpyInstance;
    let playbackFocusSpy: jest.SpyInstance;

    beforeEach(() => {
      wrappedOverlayMock = mockComponent(SettingsToggleButton);
      const overlayHtmlMock = getFirstDomElement(wrappedOverlayMock);
      overlayFocusSpy = jest.spyOn(overlayHtmlMock, 'focus');
      overlayClickSpy = jest.spyOn(overlayHtmlMock, 'click');
      playbackFocusSpy = jest.spyOn(playbackToggleButtonHtmlMock, 'focus');
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackToggleButtonHtmlMock;
        }
        if (component === wrappedOverlayMock) {
          return overlayHtmlMock;
        }
        return undefined;
      });
      overlayAvailable = true;
      jest.spyOn(TypeGuards, 'isFocusable').mockImplementation(component => {
        return component !== wrappedOverlayMock || overlayAvailable;
      });
    });

    function createGroupWithWrappedOverlay(explicitPrimary: boolean): NavigationGroup {
      const wrapperMock = mockComponent(Container);
      wrapperMock.getComponents.mockReturnValue([wrappedOverlayMock]);
      const focusableContainer = new FocusableContainer(wrapperMock, explicitPrimary ? wrappedOverlayMock : undefined);

      const navigationGroup = new NavigationGroup(rootContainerMock, focusableContainer, playbackToggleButtonMock);
      // Focus the overlay through its focusable container, as moving into the container would
      navigationGroup['focusComponent'](focusableContainer);
      expect(navigationGroup.getActiveComponent()).toBe(wrappedOverlayMock);

      return navigationGroup;
    }

    it.each`
      primary        | explicitPrimary
      ${'explicit'}  | ${true}
      ${'automatic'} | ${false}
    `(
      'should focus the next available component on SELECT with an $primary primary component',
      ({ explicitPrimary }) => {
        const navigationGroup = createGroupWithWrappedOverlay(explicitPrimary);
        overlayFocusSpy.mockClear();
        overlayAvailable = false;

        expect(() => navigationGroup.handleAction(Action.SELECT)).not.toThrow();

        expect(overlayClickSpy).not.toHaveBeenCalled();
        expect(overlayFocusSpy).not.toHaveBeenCalled();
        expect(playbackFocusSpy).toHaveBeenCalled();
        expect(navigationGroup.getActiveComponent()).toBe(playbackToggleButtonMock);
      },
    );

    it.each`
      primary        | explicitPrimary | interruption
      ${'explicit'}  | ${true}         | ${'disabled and enabled again'}
      ${'automatic'} | ${false}        | ${'disabled and enabled again'}
      ${'explicit'}  | ${true}         | ${'enabled again without being disabled'}
      ${'automatic'} | ${false}        | ${'enabled again without being disabled'}
    `(
      'should restore the next available component when $interruption with an $primary primary component',
      ({ explicitPrimary, interruption }) => {
        const navigationGroup = createGroupWithWrappedOverlay(explicitPrimary);
        if (interruption === 'disabled and enabled again') {
          navigationGroup.disable();
        }
        overlayFocusSpy.mockClear();
        overlayAvailable = false;

        expect(() => navigationGroup.enable()).not.toThrow();

        expect(overlayFocusSpy).not.toHaveBeenCalled();
        expect(playbackFocusSpy).toHaveBeenCalled();
        expect(navigationGroup.getActiveComponent()).toBe(playbackToggleButtonMock);
      },
    );

    it('should do nothing on SELECT when no component can take the focus', () => {
      const wrapperMock = mockComponent(Container);
      wrapperMock.getComponents.mockReturnValue([wrappedOverlayMock]);
      const focusableContainer = new FocusableContainer(wrapperMock);
      const navigationGroup = new NavigationGroup(rootContainerMock, focusableContainer);
      navigationGroup['focusComponent'](focusableContainer);
      overlayFocusSpy.mockClear();
      overlayAvailable = false;

      expect(() => navigationGroup.handleAction(Action.SELECT)).not.toThrow();

      expect(overlayClickSpy).not.toHaveBeenCalled();
      expect(overlayFocusSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackElementHover', () => {
    let subtitleButtonHtml: HTMLElement;
    let playbackButtonHtml: HTMLElement;
    beforeEach(() => {
      subtitleButtonHtml = getFirstDomElement(subtitleToggleButtonMock);
      playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      jest.spyOn(toHtmlElementModule, 'toHtmlElement').mockImplementation(component => {
        if (component === playbackToggleButtonMock) {
          return playbackButtonHtml;
        }
        if (component === subtitleToggleButtonMock) {
          return subtitleButtonHtml;
        }
        return undefined;
      });
    });
    it('should add mouse over listeners', () => {
      const nodeSubscriber = rootNavigationGroup['eventSubscriber'];
      rootNavigationGroup.enable();

      expect(nodeSubscriber.on).toHaveBeenCalledWith(subtitleButtonHtml, 'mouseenter', expect.anything());
      expect(nodeSubscriber.on).toHaveBeenCalledWith(playbackButtonHtml, 'mouseenter', expect.anything());
    });

    it('should remove mouse over listener when called twice', () => {
      const nodeSubscriber = rootNavigationGroup['eventSubscriber'];
      rootNavigationGroup.enable();
      rootNavigationGroup.enable();

      expect(nodeSubscriber.off).toHaveBeenCalledWith(subtitleButtonHtml, 'mouseenter', expect.anything());
      expect(nodeSubscriber.off).toHaveBeenCalledWith(playbackButtonHtml, 'mouseenter', expect.anything());
    });
  });

  describe('release', () => {
    it('should clean up', () => {
      rootNavigationGroup['activeComponent'] = subtitleToggleButtonMock;
      const eventSubscribeReleaseSpy = jest.spyOn(NodeEventSubscriber.prototype, 'release');
      rootNavigationGroup.release();

      expect(eventSubscribeReleaseSpy).toHaveBeenCalled();
      expect(rootNavigationGroup['_components']).toHaveLength(0);
      expect(rootNavigationGroup['activeComponent']).toBeUndefined();
    });
  });
});

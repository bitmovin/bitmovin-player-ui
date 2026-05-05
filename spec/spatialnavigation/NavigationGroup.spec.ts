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

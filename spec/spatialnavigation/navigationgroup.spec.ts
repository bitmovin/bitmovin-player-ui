import { NavigationGroup } from '../../src/ts/spatialnavigation/navigationgroup';
import { UIContainer } from '../../src/ts/components/uicontainer';
import { PlaybackToggleButton } from '../../src/ts/components/playbacktogglebutton';
import { SettingsToggleButton } from '../../src/ts/components/settingstogglebutton';
import { getFirstDomElement, mockComponent } from '../helper/mockComponent';
import * as navigationAlgorithm from '../../src/ts/spatialnavigation/navigationalgorithm';
import { NodeEventSubscriber } from '../../src/ts/spatialnavigation/nodeeventsubscriber';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';

jest.mock('../../src/ts/spatialnavigation/navigationalgorithm.ts');
jest.mock('../../src/ts/spatialnavigation/nodeeventsubscriber.ts');


describe('NavigationGroup', () => {
  let rootNavigationGroup: NavigationGroup;
  let rootContainerMock: jest.Mocked<UIContainer>;
  let playbackToggleButtonMock: jest.Mocked<PlaybackToggleButton>;
  let subtitleToggleButtonMock: jest.Mocked<SettingsToggleButton>;

  beforeEach(() => {
    rootContainerMock = mockComponent(UIContainer);
    playbackToggleButtonMock = mockComponent(PlaybackToggleButton);
    subtitleToggleButtonMock = mockComponent(SettingsToggleButton);
    
    rootNavigationGroup = new NavigationGroup(rootContainerMock, playbackToggleButtonMock, subtitleToggleButtonMock);

  });

  describe('getActiveElement', () => {
    it('should return active element', () => {
      const playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      rootNavigationGroup['activeElement'] = playbackButtonHtml;

      expect(rootNavigationGroup.getActiveElement()).toEqual(playbackButtonHtml);
    });
  });

  describe('enable', () => {
    it('should focus first element if there is no previous element, and not settings panel', () => {
      rootNavigationGroup['activeElementBeforeDisable'] = undefined;
      rootNavigationGroup.enable();

      expect(getFirstDomElement(playbackToggleButtonMock).focus).toHaveBeenCalled();
    });

    it('should focus last activeElementBeforeDisable if not settings panel', () => {
      const playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      rootNavigationGroup['activeElementBeforeDisable'] = playbackButtonHtml

      rootNavigationGroup.enable();
      expect(playbackButtonHtml.focus).toHaveBeenCalled();
    });
  });

  describe('disable', () => {
    it('should blur active element and save it as element before disable', () => {
      const playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      rootNavigationGroup['activeElement'] = playbackButtonHtml;
      rootNavigationGroup.disable();

      expect(playbackButtonHtml.blur).toHaveBeenCalled();
      expect(rootNavigationGroup['activeElementBeforeDisable']).toEqual(playbackButtonHtml);
    });
  });


  describe('handleNavigation', () => {
    let subtitleToggleButtonHTML: HTMLElement;

    beforeEach(() => {
      subtitleToggleButtonHTML = getFirstDomElement(subtitleToggleButtonMock);
      jest.spyOn(navigationAlgorithm, 'getElementInDirection').mockReturnValueOnce(subtitleToggleButtonHTML);
    });

    it('should focus element found by algorithm', () => {
      rootNavigationGroup['activeElement'] = getFirstDomElement(playbackToggleButtonMock);
      rootNavigationGroup.handleNavigation(Direction.DOWN);

      expect(subtitleToggleButtonHTML.focus).toHaveBeenCalled();
    });

    it('should default to the last selected item when there is no active item', () => {
      rootNavigationGroup['activeElementBeforeDisable'] = subtitleToggleButtonHTML;
      rootNavigationGroup['activeElement'] = undefined;

      rootNavigationGroup.handleNavigation(Direction.LEFT);
      
      expect(subtitleToggleButtonHTML.focus).toHaveBeenCalled();
    });

    describe('onNavigation', () => {
      it('should not call default navigation handler if propagation was stopped from the outside', () => {
        rootNavigationGroup.onNavigation = (_direction, _element, preventDefault) => preventDefault();

        rootNavigationGroup.handleNavigation(Direction.DOWN);

        expect(subtitleToggleButtonHTML.focus).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleAction', () => {
    let playButtonHTML: HTMLElement;

    beforeEach(() => {
      playButtonHTML = getFirstDomElement(subtitleToggleButtonMock);
      rootNavigationGroup['activeElement'] = playButtonHTML;
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
        rootNavigationGroup.onAction = (_action, _element, preventDefault) => preventDefault();
        rootNavigationGroup.handleAction(Action.SELECT);

        expect(playButtonHTML.click).not.toHaveBeenCalled();

      });
    });
  });

  describe('trackElementHover', () => {
    it('should add mouse over listeners', () => {
      const subtitleButtonHtml = getFirstDomElement(subtitleToggleButtonMock);
      const playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      const nodeSubscriber = rootNavigationGroup['eventSubscriber'];
      rootNavigationGroup.enable();

      expect(nodeSubscriber.on).toHaveBeenCalledWith(subtitleButtonHtml, 'mouseenter', expect.anything());
      expect(nodeSubscriber.on).toHaveBeenCalledWith(playbackButtonHtml, 'mouseenter', expect.anything());
    });

    it('should remove mouse over listener when called twice', () => {
      const subtitleButtonHtml = getFirstDomElement(subtitleToggleButtonMock);
      const playbackButtonHtml = getFirstDomElement(playbackToggleButtonMock);
      const nodeSubscriber = rootNavigationGroup['eventSubscriber'];
      rootNavigationGroup.enable();
      rootNavigationGroup.enable();

      expect(nodeSubscriber.off).toHaveBeenCalledWith(subtitleButtonHtml, 'mouseenter', expect.anything());
      expect(nodeSubscriber.off).toHaveBeenCalledWith(playbackButtonHtml, 'mouseenter', expect.anything());
    });
  });

  describe('release', () => {
    it('should clean up', () => {
      rootNavigationGroup['activeElement'] = getFirstDomElement(subtitleToggleButtonMock);
      const eventSubscribeReleaseSpy = jest.spyOn(NodeEventSubscriber.prototype, 'release');
      rootNavigationGroup.release();

      expect(eventSubscribeReleaseSpy).toHaveBeenCalled();
      expect(rootNavigationGroup['components']).toHaveLength(0);
      expect(rootNavigationGroup['activeElement']).toBeUndefined();
    });
  });
});

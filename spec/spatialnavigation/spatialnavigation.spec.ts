import { SpatialNavigation } from '../../src/ts/spatialnavigation/spatialnavigation';
import { RootNavigationGroup } from '../../src/ts/spatialnavigation/rootnavigationgroup';
import { UIContainer } from '../../src/ts/components/uicontainer';
import { NavigationGroup } from '../../src/ts/spatialnavigation/navigationgroup';
import { SettingsPanel } from '../../src/ts/components/settingspanel';
import { NodeEventSubscriber } from '../../src/ts/spatialnavigation/nodeeventsubscriber';
import { SeekBarHandler } from '../../src/ts/spatialnavigation/seekbarhandler';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';

jest.mock('../../src/ts/spatialnavigation/seekbarhandler.ts');
jest.mock('../../src/ts/spatialnavigation/nodeeventsubscriber.ts');

describe('SpatialNavigation', () => {

  let spatialNavigation: SpatialNavigation;
  let rootNavigationGroup: RootNavigationGroup;
  let rootNavigationContainer: UIContainer;

  let otherNavigationGroup: NavigationGroup;
  let otherNavigationContainer: SettingsPanel;
  
  beforeEach(() => {
    rootNavigationContainer = new UIContainer({});
    rootNavigationGroup = new RootNavigationGroup(rootNavigationContainer);
    rootNavigationContainer.hide();

    otherNavigationContainer = new SettingsPanel({});
    otherNavigationContainer.hide();
    otherNavigationGroup = new NavigationGroup(otherNavigationContainer as any);

    spatialNavigation = new SpatialNavigation(rootNavigationGroup, otherNavigationGroup);
  });

  describe('default active navigationGroup', () => {
    it('should set root navigation group as active navigation group if every group is hidden', () => {
      expect(spatialNavigation.getActiveNavigationGroup()).toEqual(rootNavigationGroup);
    });

    it('should set visible navigation group as default navigation group', () => {
      otherNavigationContainer.show();
      spatialNavigation = new SpatialNavigation(rootNavigationGroup, otherNavigationGroup);

      expect(spatialNavigation.getActiveNavigationGroup()).toEqual(otherNavigationGroup);
    });
  });

  describe('activeNavigationGroup', () => {
    it('should update active navigation group on container show', () => {
      otherNavigationContainer.show();

      expect(spatialNavigation.getActiveNavigationGroup()).toEqual(otherNavigationGroup);
    });

    it('should remove navigation group from being active on container hide', () => {
      otherNavigationContainer.show();
      otherNavigationContainer.hide();

      expect(spatialNavigation.getActiveNavigationGroup()).not.toEqual(otherNavigationGroup);
    });

    it('should return previous active navigation group when current group is hidden', () => {
      otherNavigationContainer.show();
      otherNavigationContainer.hide();

      expect(spatialNavigation.getActiveNavigationGroup()).toEqual(rootNavigationGroup);
    })
  });

  describe('handleKeyEvent', () => {
      it('should call handle navigation on active group on key event', () => {
        const rootHandleNavigationSpy = jest.spyOn(rootNavigationGroup, 'handleNavigation');
        spatialNavigation['handleKeyEvent'](new KeyboardEvent('keydown', { key:'Up', keyCode: 38 } as any));

        expect(rootHandleNavigationSpy).toHaveBeenCalledWith(Direction.UP);
      });

    it('should call handle action on active group on key event', () => {
      const rootHandleActionSpy = jest.spyOn(rootNavigationGroup, 'handleAction');
      spatialNavigation['handleKeyEvent'](new KeyboardEvent('keydown', { key:'Escape', keyCode: 27 } as any));

      expect(rootHandleActionSpy).toHaveBeenCalledWith(Action.BACK);
    });

  });

  describe('release', () => {
    it('should clean up', () => {
      const nodeEventSubscriberReleaseSpy = jest.spyOn(NodeEventSubscriber.prototype, 'release');
      const seekBarHandlerReleaseSpy = jest.spyOn(SeekBarHandler.prototype, 'release');
      const rootGroupRelease = jest.spyOn(rootNavigationGroup, 'release');
      const otherGroupRelease = jest.spyOn(otherNavigationGroup, 'release');

      spatialNavigation.release();

      expect(nodeEventSubscriberReleaseSpy).toHaveBeenCalled();
      expect(seekBarHandlerReleaseSpy).toHaveBeenCalled();
      expect(rootGroupRelease).toHaveBeenCalled();
      expect(otherGroupRelease).toHaveBeenCalled();
    });
  });
});

import { UIContainer } from '../../src/ts/components/uicontainer';
import { mockClass } from '../helper/mockClass';
import { RootNavigationGroup } from '../../src/ts/spatialnavigation/rootnavigationgroup';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';

jest.mock('../../src/ts/spatialnavigation/navigationgroup.ts');

describe('RootNavigationGroup', () => {
  let containerUiMock: jest.Mocked<UIContainer>;
  let rootNavigationGroup: RootNavigationGroup;

  beforeEach(() => {
    containerUiMock = mockClass(UIContainer);
    containerUiMock.showUi = jest.fn();
    containerUiMock.hideUi = jest.fn();
    containerUiMock.isUiShown = jest.fn();

    rootNavigationGroup = new RootNavigationGroup(containerUiMock);

  });

  describe('handleAction', () => {
    it('should call showUi on UIContainer on Action.SELECT', () => {
      rootNavigationGroup.handleAction(Action.SELECT);

      expect(containerUiMock.showUi).toHaveBeenCalled();
    });

    it('should call hideUi on UIContainer on Action.BACK', () => {
      containerUiMock.isUiShown.mockReturnValue(true);

      rootNavigationGroup['defaultActionHandler'](Action.BACK);

      expect(containerUiMock.hideUi).toHaveBeenCalled();
    });

    it('should not call hideUi on UIContainer on Action.SELECT', () => {
      rootNavigationGroup['defaultActionHandler'](Action.SELECT);

      expect(containerUiMock.hideUi).not.toHaveBeenCalled();
    })
  });

  describe('handleNavigation', () => {
    it('should call showUi on UIContainer on navigation', () => {
      rootNavigationGroup.handleNavigation(Direction.DOWN);

      expect(containerUiMock.showUi).toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('should clear up', () => {
      rootNavigationGroup.release();
    });
  });
});

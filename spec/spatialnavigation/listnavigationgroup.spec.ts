import { UIContainer } from '../../src/ts/components/uicontainer';
import { mockClass } from '../helper/mockClass';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';
import { ListNavigationGroup } from '../../src/ts/spatialnavigation/ListNavigationGroup';

jest.mock('../../src/ts/spatialnavigation/navigationgroup.ts');

describe('ListNavigationGroup', () => {
  let containerUiMock: jest.Mocked<UIContainer>;
  let listNavigationGroup: ListNavigationGroup;

  beforeEach(() => {
    containerUiMock = mockClass(UIContainer);
    containerUiMock.showUi = jest.fn();
    containerUiMock.hideUi = jest.fn();

    listNavigationGroup = new ListNavigationGroup(containerUiMock);

  });

  describe('handleAction', () => {
    it('should dispatch an Action.BACK after an Action.SELECT was tracked', () => {
      const handleActionSpy = jest.spyOn(listNavigationGroup, 'handleAction');

      listNavigationGroup.handleAction(Action.SELECT);

      expect(handleActionSpy).toHaveBeenCalledWith(Action.BACK);
    });
  });

  describe('handleNavigation', () => {
    test.each`
      direction          | shouldDispatch
      ${Direction.UP}    | ${false}
      ${Direction.DOWN}  | ${false}
      ${Direction.LEFT}  | ${true}
      ${Direction.RIGHT} | ${true}
    `('should dispatch an Action.BACK=$shouldDispatch on Direction.$direction', ({ direction, shouldDispatch }) => {
      const handleActionSpy = jest.spyOn(listNavigationGroup, 'handleAction');

      listNavigationGroup.handleNavigation(direction);

      if (shouldDispatch) {
        expect(handleActionSpy).toHaveBeenCalledWith(Action.BACK);
      } else {
        expect(handleActionSpy).not.toHaveBeenCalled();
      }
    });
  });
});

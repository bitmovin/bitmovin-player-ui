import { UIContainer } from '../../src/ts/components/uicontainer';
import { mockClass } from '../helper/mockClass';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';
import { ListNavigationGroup, ListOrientation } from '../../src/ts/spatialnavigation/ListNavigationGroup';

jest.mock('../../src/ts/spatialnavigation/navigationgroup.ts');

describe('ListNavigationGroup', () => {
  let containerUiMock: jest.Mocked<UIContainer>;

  beforeEach(() => {
    containerUiMock = mockClass(UIContainer);
    containerUiMock.showUi = jest.fn();
    containerUiMock.hideUi = jest.fn();
  });

  describe('handleAction', () => {
    it('should dispatch an Action.BACK after an Action.SELECT was tracked', () => {
      const listNavigationGroup = new ListNavigationGroup(ListOrientation.Vertical, containerUiMock);
      const handleActionSpy = jest.spyOn(listNavigationGroup, 'handleAction');

      listNavigationGroup.handleAction(Action.SELECT);

      expect(handleActionSpy).toHaveBeenCalledWith(Action.BACK);
    });
  });

  describe('handleNavigation', () => {
    test.each`
      direction          | orientation                   | shouldDispatch
      ${Direction.UP}    | ${ListOrientation.Vertical}   | ${false}
      ${Direction.DOWN}  | ${ListOrientation.Vertical}   | ${false}
      ${Direction.LEFT}  | ${ListOrientation.Vertical}   | ${true}
      ${Direction.RIGHT} | ${ListOrientation.Vertical}   | ${true}
      ${Direction.UP}    | ${ListOrientation.Horizontal} | ${true}
      ${Direction.DOWN}  | ${ListOrientation.Horizontal} | ${true}
      ${Direction.LEFT}  | ${ListOrientation.Horizontal} | ${false}
      ${Direction.RIGHT} | ${ListOrientation.Horizontal} | ${false}
    `(
      'should dispatch an Action.BACK=$shouldDispatch on Direction.$direction with Orientation.$orientation',
      ({ direction, orientation, shouldDispatch }) => {
        const listNavigationGroup = new ListNavigationGroup(orientation, containerUiMock);
        const handleActionSpy = jest.spyOn(listNavigationGroup, 'handleAction');

        listNavigationGroup.handleNavigation(direction);

        if (shouldDispatch) {
          expect(handleActionSpy).toHaveBeenCalledWith(Action.BACK);
        } else {
          expect(handleActionSpy).not.toHaveBeenCalled();
        }
      },
    );
  });
});

import { UIContainer } from '../../src/ts/components/UIContainer';
import { mockClass } from '../helper/mockClass';
import { RootNavigationGroup } from '../../src/ts/spatialnavigation/RootNavigationGroup';
import { Action, Direction } from '../../src/ts/spatialnavigation/types';

jest.mock('../../src/ts/spatialnavigation/NavigationGroup.ts');

describe('RootNavigationGroup', () => {
  let containerUiMock: jest.Mocked<UIContainer>;
  let rootNavigationGroup: RootNavigationGroup;

  beforeEach(() => {
    containerUiMock = mockClass(UIContainer);
    containerUiMock.showUi = jest.fn();
    containerUiMock.hideUi = jest.fn();
    containerUiMock.getDomElement = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        classList: {
          [Symbol.iterator]: function* () {
            yield 'bmpui-controls-hidden';
          },
        },
      }),
    } as any);

    rootNavigationGroup = new RootNavigationGroup(containerUiMock);
  });

  describe('handleAction', () => {
    it('should call showUi on UIContainer on Action.SELECT', () => {
      rootNavigationGroup.handleAction(Action.SELECT);

      expect(containerUiMock.showUi).toHaveBeenCalled();
    });

    it('should call hideUi on UIContainer on Action.BACK', () => {
      containerUiMock.getDomElement = jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({
          classList: {
            [Symbol.iterator]: function* () {
              yield 'bmpui-controls-shown';
            },
          },
        }),
      } as any);
      const handled = rootNavigationGroup['defaultActionHandler'](Action.BACK);

      expect(containerUiMock.hideUi).toHaveBeenCalled();
      expect(handled).toBe(true);
    });

    it('should not call hideUi on UIContainer on Action.SELECT', () => {
      rootNavigationGroup['defaultActionHandler'](Action.SELECT);

      expect(containerUiMock.hideUi).not.toHaveBeenCalled();
    });

    it('should not handle Action.BACK when the UI is already hidden', () => {
      const handled = rootNavigationGroup['defaultActionHandler'](Action.BACK);

      expect(containerUiMock.hideUi).not.toHaveBeenCalled();
      expect(handled).toBe(false);
    });
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

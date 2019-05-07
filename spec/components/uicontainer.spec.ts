import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIContainer } from '../../src/ts/components/uicontainer';
import { UIInstanceManager } from '../../src/ts/uimanager';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

describe('UIContainer', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('release', () => {
    let uiContainer: UIContainer;
    beforeEach(() => {
      uiContainer = new UIContainer({
        hideDelay: -1, // With an hideDelay of -1 the uiHideTimeout and userInteractionEvents never will be initialized
        components: [],
      });
    });

    describe('with configured hide delay of -1', () => {
      it('works without calling configure', () => {
        // Ensure that we don't try to call something on undefined properties
        expect((uiContainer as any).uiHideTimeout).toBeUndefined();
        expect((uiContainer as any).userInteractionEvents).toBeUndefined();

        uiContainer.release();
      });

      it('works with calling configure', () => {
        uiContainer.configure(playerMock, uiInstanceManagerMock);

        uiContainer.release();
        // Ensure that we don't try to call something on undefined properties
        expect((uiContainer as any).uiHideTimeout).toBeUndefined();
        expect((uiContainer as any).userInteractionEvents).toBeUndefined();
      });
    });
  });
});

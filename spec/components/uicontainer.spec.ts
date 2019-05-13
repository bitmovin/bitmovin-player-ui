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
      /* no exception expected */
      it('works without calling configure', () => {
        uiContainer.release();
      });

      /* no exception expected */
      it('works with calling configure', () => {
        uiContainer.configure(playerMock, uiInstanceManagerMock);

        uiContainer.release();
      });
    });
  });
});

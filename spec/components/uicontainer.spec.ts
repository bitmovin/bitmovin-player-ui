import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIContainer } from '../../src/ts/components/uicontainer';

let playerMock: TestingPlayerAPI;

describe('UIContainer', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
  });

  describe('release', () => {
    it('checks if userInteractionEvents and uiHideTimeout is undefined', () => {
      const uiContainer = new UIContainer({
        hideDelay: -1, // With an hideDelay of -1 the uiHideTimeout and userInteractionEvents never will be initialized
        components: [],
      });

      uiContainer.release();
      // Ensure that we don't try to call something on undefined properties
      expect((uiContainer as any).uiHideTimeout).toBeUndefined();
      expect((uiContainer as any).userInteractionEvents).toBeUndefined();
    });
  });
});

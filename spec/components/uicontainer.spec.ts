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

  describe('user interaction handling', () => {
    let uiContainer: UIContainer;
    const jsEventCallbacks: { [eventName: string]: EventListener; } = {};

    const prepareUserEventMocking = () => {
      const userInteractionEventSource = uiContainer.getDomElement();

      // Prepare event faking
      userInteractionEventSource.on = (eventName: string, eventHandler: EventListener) => {
        jsEventCallbacks[eventName] = eventHandler;
        return userInteractionEventSource;
      };
    };

    beforeEach(() => {
      uiContainer = new UIContainer({
        components: [],
      });

      prepareUserEventMocking();
    });

    it('does trigger onControlsShow on mouse move event', () => {
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      // For this test it's fine to call without event object
      jsEventCallbacks['mousemove'](null);

      expect(uiInstanceManagerMock.onControlsShow.dispatch).toHaveBeenCalled();
    });

    it('does not trigger onControlsShow on mouse move event if we are in touch phase', () => {
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      // For this test it's fine to call without event object
      jsEventCallbacks['touchstart'](null);
      jsEventCallbacks['mousemove'](null);

      expect(uiInstanceManagerMock.onControlsShow.dispatch).not.toHaveBeenCalled();
    });
  });
});

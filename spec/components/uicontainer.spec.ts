import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIContainer } from '../../src/ts/components/uicontainer';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { PlayerUtils } from '../../src/ts/playerutils';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

describe('UIContainer', () => {
  let uiContainer: UIContainer;
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('release', () => {
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

  describe('automatically hiding', () => {
    describe('hidePlayerStateExceptions', () => {
      it('UI does not hide itself when switching into prevented state', () => {
        uiContainer = new UIContainer({
          components: [],
          hidePlayerStateExceptions: [PlayerUtils.PlayerState.Prepared],
        });
        uiContainer.configure(playerMock, uiInstanceManagerMock);

        let uiHideTimeoutSpy: any = jest.spyOn((uiContainer as any).uiHideTimeout, 'start');
        playerMock.eventEmitter.fireSourceLoadedEvent();

        expect(uiHideTimeoutSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('isUiShown', () => {
    let uiContainer: UIContainer;

    beforeEach(() => {
      uiContainer = new UIContainer({ components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);
    });

    it('should return false if the container is hidden', () => {
      uiContainer.hideUi();

      expect(uiContainer.isUiShown()).toBeFalsy();
    });

    it('should return true if the container is shown', () => {
      uiContainer.showUi();

      expect(uiContainer.isUiShown()).toBeTruthy();
    });
  });

  describe('userInteractionEvents', () => {
    describe('on keydown', () => {
      let uiContainer: UIContainer;
      let showUiSpy: jest.SpyInstance;
      let keyDownEvent: KeyboardEvent;
      let keyDownEventHandler: EventListener;

      beforeEach(() => {
        keyDownEvent = new KeyboardEvent('keydown');
        uiContainer = new UIContainer({ components: [] });
        uiContainer.configure(playerMock, uiInstanceManagerMock);
        keyDownEventHandler = getKeyDownEventHandler(uiContainer);
        showUiSpy = jest.spyOn(uiContainer, 'showUi');
      });

      it('should show the UI by default', () => {
        keyDownEventHandler(keyDownEvent);

        expect(showUiSpy).toHaveBeenCalled();
      });

      it('should show the UI if shouldShowUi returns true', () => {
        uiContainer.shouldShowUi = () => true;

        keyDownEventHandler(keyDownEvent);

        expect(showUiSpy).toHaveBeenCalled();
      });

      it('should not show the UI if shouldShowUi returns false', () => {
        uiContainer.shouldShowUi = () => false;

        keyDownEventHandler(keyDownEvent);

        expect(showUiSpy).not.toHaveBeenCalled();
      });
    });
  });
});

function getKeyDownEventHandler(uiContainer: UIContainer): EventListener {
  const keyDownEventHandler = uiContainer['userInteractionEvents'].find(userInteractionEvent => userInteractionEvent.name === 'keydown');

  if (!keyDownEventHandler || typeof keyDownEventHandler.handler !== 'function') {
    throw new Error('keydown event handler not available');
  }

  return keyDownEventHandler.handler;
}

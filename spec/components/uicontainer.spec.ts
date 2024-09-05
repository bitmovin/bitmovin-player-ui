import { UIContainer } from '../../src/ts/components/uicontainer';
import { PlayerUtils } from '../../src/ts/playerutils';
import type { UIInstanceManager } from '../../src/ts/uimanager';
import type { TestingPlayerAPI } from '../helper/MockHelper';
import { MockHelper } from '../helper/MockHelper';

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
        hideDelay: 3000,
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

  describe('configure', () => {
    it('should subscribe to the onComponentViewModeChanged event', () => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      expect(uiInstanceManagerMock.onComponentViewModeChanged.subscribe).toHaveBeenCalled();
    });
  });

  describe('suspendHideTimeout', () => {
    it('should suspend the hide timeout', () => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      const suspendSpy = jest.spyOn(uiContainer['uiHideTimeout'], 'suspend');

      uiContainer['suspendHideTimeout']();

      expect(suspendSpy).toHaveBeenCalled();
    });
  });

  describe('resumeHideTimeout', () => {
    test.each`
      hidingPrevented | shouldReset
      ${true}         | ${false}
      ${false}        | ${true}
    `('should resume and reset=$shouldReset the hide timeout', ({ hidingPrevented, shouldReset }) => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      const resume = jest.spyOn(uiContainer['uiHideTimeout'], 'resume');

      uiContainer['hidingPrevented'] = () => hidingPrevented;
      uiContainer['resumeHideTimeout']();

      expect(resume).toHaveBeenCalledWith(shouldReset);
    });
  });
});

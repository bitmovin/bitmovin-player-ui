import { UIContainer } from '../../src/ts/components/UIContainer';
import { PlayerUtils } from '../../src/ts/utils/PlayerUtils';
import type { UIInstanceManager } from '../../src/ts/UIManager';
import type { TestingPlayerAPI } from '../helper/MockHelper';
import { MockHelper } from '../helper/MockHelper';
import generateDOMMock = MockHelper.generateDOMMock;
import getUiInstanceManagerMock = MockHelper.getUiInstanceManagerMock;
import getPlayerMock = MockHelper.getPlayerMock;

jest.mock('../../src/ts/DOM', generateDOMMock);

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

describe('UIContainer', () => {
  let uiContainer: UIContainer;
  beforeEach(() => {
    playerMock = getPlayerMock();
    uiInstanceManagerMock = getUiInstanceManagerMock();
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

        const uiHideTimeoutSpy: any = jest.spyOn((uiContainer as any).uiHideTimeout, 'start');
        playerMock.eventEmitter.fireSourceLoadedEvent();

        expect(uiHideTimeoutSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('status announcements', () => {
    let announceMock: jest.Mock;

    beforeEach(() => {
      announceMock = jest.fn();
      uiInstanceManagerMock.announce = announceMock;
    });

    it('should announce the end of playback', () => {
      uiContainer = new UIContainer({ hideDelay: -1, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.PlaybackFinished, timestamp: 0 });

      expect(announceMock).toHaveBeenCalledWith('Playback finished');
    });

    it('should not announce playback state changes the playback toggle already conveys', () => {
      uiContainer = new UIContainer({ hideDelay: -1, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.firePlayEvent();
      playerMock.eventEmitter.firePauseEvent();

      expect(announceMock).not.toHaveBeenCalled();
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

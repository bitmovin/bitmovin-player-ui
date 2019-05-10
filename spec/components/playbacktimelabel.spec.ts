import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { PlaybackTimeLabel } from '../../src/ts/components/playbacktimelabel';

const liveEdgeActiveCssClassName = 'ui-playbacktimelabel-live-edge';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let playbackTimeLabel: PlaybackTimeLabel;

describe('PlaybackTimeLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
    jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-20);

    playbackTimeLabel = new PlaybackTimeLabel();
  });

  describe('live edge indicator', () => {
    describe('switch to inactive', () => {
      let removeClassSpy: any;
      beforeEach(() => {
        // When the player is setup with sourceOptions.startTime within a live stream, no TimeShifted event will be
        // fired so we need to listen also on the Playing event

        // During setup of the UI it could be that getTimeShift returns 0
        jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(0);

        // Setup DOM Mock
        const mockDomElement = MockHelper.generateDOMMock();
        removeClassSpy = jest.spyOn(mockDomElement, 'removeClass');
        jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);
        playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);

      });

      it('on Playing event', () => {
        // getTimeShift value when the PlayingEvent is fired
        jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(-10);
        playerMock.eventEmitter.firePlayingEvent();

        expect(removeClassSpy).toHaveBeenCalledWith(expect.stringContaining(liveEdgeActiveCssClassName));
      });
    });
  });
});

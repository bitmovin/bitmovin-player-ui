import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from '../../src/ts/components/playbacktimelabel';

const liveEdgeActiveCssClassName = 'ui-playbacktimelabel-live-edge';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let playbackTimeLabel: PlaybackTimeLabel;

describe('PlaybackTimeLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('live edge indicator', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-20);

      playbackTimeLabel = new PlaybackTimeLabel();
    });

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

  describe('TimeLabelMode', () => {
    it('displays the remaining time', () => {
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.RemainingTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(30);

      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(playbackTimeLabel.getText()).toEqual('01:10');
    });

    it('displays the total time', () => {
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(playbackTimeLabel.getText()).toEqual('01:40');
    });
  });
});

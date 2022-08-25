import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from '../../src/ts/components/playbacktimelabel';
import { PlayerEvent, PlayerEventBase } from 'bitmovin-player';

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
      playerMock.eventEmitter.fireEvent<PlayerEventBase>(
        {type: PlayerEvent.Ready, timestamp: Date.now()}
      );
      expect(playbackTimeLabel.getText()).toEqual('01:10');
    });

    it('displays the total time mm:ss if duration is lower than 1 hour', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      playerMock.eventEmitter.fireEvent<PlayerEventBase>(
        {type: PlayerEvent.Ready, timestamp: Date.now()}
      );
      expect(playbackTimeLabel.getText()).toEqual('01:40');
    });

    it('displays the total time hh:mm:ss', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(0);
      expect(playbackTimeLabel.getText()).toEqual(undefined);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(3600);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      playerMock.eventEmitter.fireEvent<PlayerEventBase>(
        {type: PlayerEvent.Ready, timestamp: Date.now()}
      );
      expect(playbackTimeLabel.getText()).toEqual('01:00:00');
    });
  });

  describe('updates when a live stream switches to vod', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(0);

      const mockDomElement = MockHelper.generateDOMMock();
      playbackTimeLabel = new PlaybackTimeLabel();

      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
    });

    it('becomes visible', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      const showSpy = jest.spyOn(playbackTimeLabel, 'show');

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(showSpy).toHaveBeenCalled();
    });

    it('displays the current time', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue({
        start: 100,
        end: 200,
      });
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(150);

      const setTimeSpy = jest.spyOn(playbackTimeLabel, 'setTime');

      playerMock.eventEmitter.fireDurationChangedEvent();
      playerMock.eventEmitter.fireTimeChangedEvent(150);

      expect(setTimeSpy).toHaveBeenCalledWith(50, 100);
    });
  });
});

import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from '../../../src/ts/components/labels/PlaybackTimeLabel';
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

    describe('keyboard accessibility', () => {
      let mockDomElement: ReturnType<typeof MockHelper.generateDOMMock>;

      const getKeydownHandler = (): ((event: KeyboardEvent) => void) => {
        const handler = mockDomElement.on.mock.calls.find(([eventName]) => eventName === 'keydown')?.[1];
        expect(handler).toEqual(expect.any(Function));
        return handler as (event: KeyboardEvent) => void;
      };

      beforeEach(() => {
        mockDomElement = MockHelper.generateDOMMock();
        jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

        playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      });

      it('exposes the live indicator as an accessible button', () => {
        expect(mockDomElement.attr).toHaveBeenCalledWith('tabindex', '0');
        expect(mockDomElement.attr).toHaveBeenCalledWith('role', 'button');
        expect(mockDomElement.attr).toHaveBeenCalledWith('aria-label', 'Live, jump to live edge');
      });

      it.each(['Enter', ' '])('jumps to the live edge when pressing %p', key => {
        const keydownHandler = getKeydownHandler();
        const keyboardEvent = {
          key,
          preventDefault: jest.fn(),
        } as unknown as KeyboardEvent;

        keydownHandler(keyboardEvent);

        expect(keyboardEvent.preventDefault).toHaveBeenCalled();
        expect(playerMock.timeShift).toHaveBeenCalledWith(0);
      });

      it('jumps to the live edge when Space is reported through the event code', () => {
        const keydownHandler = getKeydownHandler();
        const keyboardEvent = {
          key: 'Unidentified',
          code: 'Space',
          preventDefault: jest.fn(),
        } as unknown as KeyboardEvent;

        keydownHandler(keyboardEvent);

        expect(keyboardEvent.preventDefault).toHaveBeenCalled();
        expect(playerMock.timeShift).toHaveBeenCalledWith(0);
      });

      it('prevents repeated activation keys without jumping to the live edge again', () => {
        const keydownHandler = getKeydownHandler();
        const keyboardEvent = {
          key: ' ',
          code: 'Space',
          repeat: true,
          preventDefault: jest.fn(),
        } as unknown as KeyboardEvent;

        keydownHandler(keyboardEvent);

        expect(keyboardEvent.preventDefault).toHaveBeenCalled();
        expect(playerMock.timeShift).not.toHaveBeenCalled();
      });

      it('ignores unrelated keys', () => {
        const keydownHandler = getKeydownHandler();
        const keyboardEvent = {
          key: 'ArrowRight',
          preventDefault: jest.fn(),
        } as unknown as KeyboardEvent;

        keydownHandler(keyboardEvent);

        expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
        expect(playerMock.timeShift).not.toHaveBeenCalled();
      });

      it('restores non-interactive semantics when switching to VOD', () => {
        const keydownHandler = getKeydownHandler();
        jest.spyOn(playerMock, 'isLive').mockReturnValue(false);

        playerMock.eventEmitter.fireDurationChangedEvent();

        expect(mockDomElement.attr).toHaveBeenCalledWith('tabindex', '-1');
        expect(mockDomElement.removeAttr).toHaveBeenCalledWith('role');
        expect(mockDomElement.removeAttr).toHaveBeenCalledWith('aria-label');
        expect(mockDomElement.off).toHaveBeenCalledWith('keydown', keydownHandler);
      });
    });

    it('does not enable live interaction when configured to hide during live playback', () => {
      const mockDomElement = MockHelper.generateDOMMock();
      playbackTimeLabel = new PlaybackTimeLabel({ hideInLivePlayback: true });
      const subscribeSpy = jest.spyOn(playbackTimeLabel.onClick, 'subscribe');
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);

      expect(subscribeSpy).not.toHaveBeenCalled();
      expect(mockDomElement.attr).not.toHaveBeenCalledWith('tabindex', '0');
      expect(mockDomElement.attr).not.toHaveBeenCalledWith('role', 'button');
      expect(mockDomElement.on).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('restores the configured tab index when switching to VOD', () => {
      const mockDomElement = MockHelper.generateDOMMock();
      playbackTimeLabel = new PlaybackTimeLabel({
        tabIndex: 2,
      });
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(mockDomElement.attr).toHaveBeenCalledWith('tabindex', '2');
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

    it('displays the total time mm:ss if duration is lower than 1 hour', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(playbackTimeLabel.getText()).toEqual('01:40');
    });

    it('displays the total time hh:mm:ss if duration is greater than 1 hour', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(3600);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(playbackTimeLabel.getText()).toEqual('01:00:00');
    });

    it('updates time format on ready event', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playbackTimeLabel = new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime });

      // Setup DOM Mock
      const mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(playbackTimeLabel, 'getDomElement').mockReturnValue(mockDomElement);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(0);
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(playbackTimeLabel.getText()).toEqual('00:00');

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(3600);
      playerMock.eventEmitter.fireReadyEvent();
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

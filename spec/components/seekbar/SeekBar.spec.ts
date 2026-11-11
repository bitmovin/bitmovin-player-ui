import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { SeekBar } from '../../../src/ts/components/seekbar/SeekBar';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { Timeout } from '../../../src/ts/utils/Timeout';
import { DOM } from '../../../src/ts/DOM';
import type { SeekBarLabel } from '../../../src/ts/components/seekbar/SeekBarLabel';
import { ViewMode } from '../../../src/ts/components/Component';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let seekbar: SeekBar;

describe('SeekBar', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    seekbar = new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: 1 });
    seekbar.getDomElement();
  });

  describe('becomes visible when switching from live to vod', () => {
    it('when live had no time shift', () => {
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(0);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);

      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      const showSpy = jest.spyOn(seekbar, 'show');

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe('disables smoothPlaybackPositionUpdater on Live Streams', () => {
    it('clears smoothPlaybackPositionUpdater when AD is finished', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playerMock.eventEmitter.fireAdBreakStartedEvent();

      const playbackUpdater: Timeout = (seekbar as any).smoothPlaybackPositionUpdater;
      const clearSpy = jest.spyOn(playbackUpdater, 'clear');

      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      playerMock.eventEmitter.fireAdBreakFinishedEvent();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('playback position', () => {
    let setPlaybackPositionSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      setPlaybackPositionSpy = jest.spyOn(seekbar, 'setPlaybackPosition');
    });

    test.each`
      isLive   | isSeeking | timesCalled
      ${false} | ${true}   | ${0}
      ${true}  | ${true}   | ${0}
      ${false} | ${false}  | ${1}
      ${true}  | ${false}  | ${1}
    `(
      'will not be set when isLive=$isLive, isSeeking=$isSeeking and a stall ended event is fired',
      ({ isLive, isSeeking, timesCalled }) => {
        if (isLive) {
          jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
        }
        jest.spyOn(seekbar, 'isSeeking').mockReturnValue(isSeeking);
        jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);

        playerMock.eventEmitter.fireStallEndedEvent();

        expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(timesCalled);
      },
    );

    it('will be moved after a successful seeked event', () => {
      playerMock.eventEmitter.fireSeekedEvent();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(1);
    });

    it('will move after a successful segment request download', () => {
      playerMock.eventEmitter.fireSegmentRequestFinished();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(1);
    });

    describe('vod event tracking', () => {
      let setBufferPositionSpy: jest.SpyInstance;

      beforeEach(() => {
        setBufferPositionSpy = jest.spyOn(seekbar, 'setBufferPosition');

        jest.spyOn(playerMock, 'getDuration').mockReturnValue(50);

        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 30, end: 40 }));

        const currentTime = 35;
        jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(currentTime);

        playerMock.eventEmitter.fireSeekEvent(currentTime);
        playerMock.eventEmitter.fireSeekedEvent();
      });

      it('will use the last known playback position location after a successful segment request download and the user is scrubbing', () => {
        const firstPlaybackPercentage = seekbar['playbackPositionPercentage'];

        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 26, end: 30 }));

        seekbar['onSeekPreviewEvent'](40, 100, true);

        playerMock.eventEmitter.fireSegmentRequestFinished();

        expect(setPlaybackPositionSpy).toHaveBeenLastCalledWith(firstPlaybackPercentage);

        const expectedPlaybackPercentage = 18;
        expect(setBufferPositionSpy).toHaveBeenLastCalledWith(expectedPlaybackPercentage);
      });

      it('will update the scrubber location after a successful segment request download and the user is not scrubbing', () => {
        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 26, end: 30 }));

        seekbar['onSeekPreviewEvent'](18, 100, false);

        playerMock.eventEmitter.fireSegmentRequestFinished();

        expect(setPlaybackPositionSpy).toHaveBeenLastCalledWith(18);
        expect(setBufferPositionSpy).toHaveBeenLastCalledWith(18);
      });
    });
  });

  describe('pending seek when the source is unloaded', () => {
    // The DOM is mocked, so the seeking state cannot be read back from the CSS class and is tracked here instead.
    let isSeekingState: boolean;

    beforeEach(() => {
      isSeekingState = false;
      jest.spyOn(seekbar, 'setSeeking').mockImplementation(seeking => {
        isSeekingState = seeking;
      });
      jest.spyOn(seekbar, 'isSeeking').mockImplementation(() => isSeekingState);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    it('leaves the seeking state so playback positions of the next source are applied again', () => {
      playerMock.eventEmitter.fireSeekEvent();
      expect(isSeekingState).toBe(true);

      // The seek never finishes, so no Seeked event is fired before the source goes away.
      playerMock.eventEmitter.fireSourceUnloadedEvent();
      expect(isSeekingState).toBe(false);

      const setPlaybackPositionSpy = jest.spyOn(seekbar, 'setPlaybackPosition');
      playerMock.eventEmitter.fireSourceLoadedEvent();
      playerMock.eventEmitter.fireStallEndedEvent();

      expect(setPlaybackPositionSpy).toHaveBeenCalled();
    });
  });

  describe('group playback', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(0);
      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    it('should suspend active group session on seeking', () => {
      const beginSuspensionSpy = jest.fn();
      (playerMock as any).groupPlayback = {
        hasJoined: () => true,
        beginSuspension: beginSuspensionSpy,
      };

      seekbar['onSeekEvent']();

      expect(seekbar['isUserSeeking']).toBe(true);
      expect(uiInstanceManagerMock.onSeek.dispatch).toHaveBeenCalled();
      expect(beginSuspensionSpy).toHaveBeenCalled();
    });
  });

  describe('buffer levels', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);

      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    test.each`
      isLive
      ${true}
      ${false}
    `('should get updated accordingly when a request has finished and isLive=$isLive', ({ isLive }) => {
      const setBufferPositionSpy = jest.spyOn(seekbar, 'setBufferPosition');
      jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(35);
      jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue({ start: 30, end: 40 });

      playerMock.eventEmitter.fireSegmentRequestFinished();

      expect(setBufferPositionSpy).toHaveBeenCalledTimes(1);
      expect(setBufferPositionSpy).toHaveBeenCalledWith(isLive ? 100 : 25);
    });
  });

  describe('seek preview label', () => {
    // This block uses the real DOM implementation (via jest.isolateModules + jest.unmock), so that mouse and keyboard
    // events dispatched on the elements reach the handlers of the seek bar and its label.
    const hideDelayMs = 300;
    let RealSeekBar: typeof SeekBar;
    let RealSeekBarLabel: typeof SeekBarLabel;
    let label: SeekBarLabel;
    let seekBarElement: HTMLElement;
    let labelElement: HTMLElement;

    const dispatchMouseEvent = (element: HTMLElement, type: string) => {
      element.dispatchEvent(new MouseEvent(type, { cancelable: true }));
    };

    const pressKey = (key: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      document.dispatchEvent(event);
      return event;
    };

    const hoverSeekBar = () => {
      dispatchMouseEvent(seekBarElement, 'mouseenter');
      dispatchMouseEvent(seekBarElement, 'mousemove');
    };

    beforeAll(() => {
      jest.isolateModules(() => {
        jest.unmock('../../../src/ts/DOM');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        RealSeekBar = require('../../../src/ts/components/seekbar/SeekBar').SeekBar;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        RealSeekBarLabel = require('../../../src/ts/components/seekbar/SeekBarLabel').SeekBarLabel;
      });
    });

    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);

      label = new RealSeekBarLabel();
      seekbar = new RealSeekBar({ label });
      // Label positioning requires a rendered UI, which is not relevant for showing and hiding the label
      jest.spyOn(seekbar as any, 'onSeekPreviewEvent').mockImplementation(() => {});
      seekbar.getDomElement();
      seekbar.initialize();
      seekbar.configure(playerMock, uiInstanceManagerMock);

      seekBarElement = seekbar['seekBar'].get(0);
      labelElement = label.getDomElement().get(0);
    });

    afterEach(() => {
      seekbar.release();
      jest.useRealTimers();
    });

    it('should show the label when the pointer hovers the seek bar', () => {
      expect(label.isHidden()).toBe(true);

      hoverSeekBar();

      expect(label.isShown()).toBe(true);
    });

    it('should hide the label after a delay when the pointer leaves the seek bar', () => {
      hoverSeekBar();
      dispatchMouseEvent(seekBarElement, 'mouseleave');

      jest.advanceTimersByTime(hideDelayMs - 1);
      expect(label.isShown()).toBe(true);

      jest.advanceTimersByTime(1);
      expect(label.isHidden()).toBe(true);
    });

    it('should keep the label visible while the pointer is on the label', () => {
      hoverSeekBar();
      dispatchMouseEvent(seekBarElement, 'mouseleave');
      dispatchMouseEvent(labelElement, 'mouseenter');
      jest.advanceTimersByTime(hideDelayMs * 10);

      expect(label.isShown()).toBe(true);
    });

    it('should hide the label after a delay when the pointer leaves the label', () => {
      hoverSeekBar();
      dispatchMouseEvent(seekBarElement, 'mouseleave');
      dispatchMouseEvent(labelElement, 'mouseenter');
      dispatchMouseEvent(labelElement, 'mouseleave');

      jest.advanceTimersByTime(hideDelayMs - 1);
      expect(label.isShown()).toBe(true);

      jest.advanceTimersByTime(1);
      expect(label.isHidden()).toBe(true);
    });

    it('should keep the label visible when the pointer returns to the seek bar within the delay', () => {
      hoverSeekBar();
      dispatchMouseEvent(seekBarElement, 'mouseleave');
      jest.advanceTimersByTime(hideDelayMs / 2);
      hoverSeekBar();
      jest.advanceTimersByTime(hideDelayMs * 10);

      expect(label.isShown()).toBe(true);
    });

    it('should hide the label immediately when a touch ends', () => {
      hoverSeekBar();
      seekBarElement.dispatchEvent(new Event('touchend', { cancelable: true }));

      expect(label.isHidden()).toBe(true);
    });

    it('should hide the label when Escape is pressed without consuming the key event', () => {
      const otherEscapeHandler = jest.fn();
      document.addEventListener('keydown', otherEscapeHandler);
      hoverSeekBar();

      const event = pressKey('Escape');
      document.removeEventListener('keydown', otherEscapeHandler);

      expect(label.isHidden()).toBe(true);
      expect(event.defaultPrevented).toBe(false);
      expect(otherEscapeHandler).toHaveBeenCalledWith(event);
    });

    it.each(['Enter', 'ArrowLeft', ' '])('should keep the label visible when %p is pressed', key => {
      hoverSeekBar();

      pressKey(key);

      expect(label.isShown()).toBe(true);
    });

    it('should not show the label again after Escape until the pointer re-enters the seek bar', () => {
      hoverSeekBar();
      pressKey('Escape');

      dispatchMouseEvent(seekBarElement, 'mousemove');
      expect(label.isHidden()).toBe(true);

      dispatchMouseEvent(seekBarElement, 'mouseleave');
      hoverSeekBar();
      expect(label.isShown()).toBe(true);
    });

    it('should hide the label when Escape is pressed while the pointer is on the label', () => {
      hoverSeekBar();
      dispatchMouseEvent(seekBarElement, 'mouseleave');
      dispatchMouseEvent(labelElement, 'mouseenter');
      jest.advanceTimersByTime(hideDelayMs);
      expect(label.isShown()).toBe(true);

      pressKey('Escape');

      expect(label.isHidden()).toBe(true);
    });

    describe('auto-hide of the UI', () => {
      let viewModes: string[];

      const hoverLabel = () => {
        hoverSeekBar();
        dispatchMouseEvent(seekBarElement, 'mouseleave');
        dispatchMouseEvent(labelElement, 'mouseenter');
      };

      beforeEach(() => {
        viewModes = [];
        seekbar.onViewModeChanged.subscribe((_, { mode }) => viewModes.push(mode));
      });

      it.each([
        ['the seek bar', hoverSeekBar],
        ['the label', hoverLabel],
      ])('should prevent the UI from hiding while %s is hovered', (_, hover) => {
        hover();
        jest.advanceTimersByTime(hideDelayMs * 10);

        expect(viewModes).toEqual([ViewMode.Persistent]);
      });

      it('should keep preventing the UI from hiding while the pointer moves between the seek bar and the label', () => {
        hoverLabel();
        dispatchMouseEvent(labelElement, 'mouseleave');
        hoverSeekBar();
        dispatchMouseEvent(seekBarElement, 'mouseleave');
        dispatchMouseEvent(labelElement, 'mouseenter');
        jest.advanceTimersByTime(hideDelayMs * 10);

        expect(viewModes).toEqual([ViewMode.Persistent]);
      });

      it('should not prevent the UI from hiding after Escape while the seek bar is still hovered', () => {
        hoverSeekBar();
        pressKey('Escape');
        dispatchMouseEvent(seekBarElement, 'mousemove');

        expect(viewModes).toEqual([ViewMode.Persistent, ViewMode.Temporary]);
      });

      it.each([
        ['the pointer leaves the seek bar', () => dispatchMouseEvent(seekBarElement, 'mouseleave')],
        [
          'the pointer leaves the label',
          () => {
            dispatchMouseEvent(seekBarElement, 'mouseleave');
            dispatchMouseEvent(labelElement, 'mouseenter');
            dispatchMouseEvent(labelElement, 'mouseleave');
          },
        ],
        ['Escape is pressed', () => pressKey('Escape')],
        ['the seek bar is released', () => seekbar.release()],
        [
          'the UI becomes inactive',
          () => {
            const onInactiveMock = uiInstanceManagerMock.onInactive as unknown as { subscribe: jest.Mock };
            const [onInactive] = MockHelper.getMockCall(onInactiveMock.subscribe);
            (onInactive as () => void)();
          },
        ],
      ])('should let the UI hide again when %s', (_, endHover) => {
        hoverSeekBar();

        endHover();
        jest.advanceTimersByTime(hideDelayMs);

        expect(viewModes).toEqual([ViewMode.Persistent, ViewMode.Temporary]);
      });

      it('should keep preventing the UI from hiding until the hide delay has passed after the pointer left', () => {
        hoverSeekBar();
        dispatchMouseEvent(seekBarElement, 'mouseleave');
        jest.advanceTimersByTime(hideDelayMs - 1);

        expect(viewModes).toEqual([ViewMode.Persistent]);
      });

      it('should show the preview again during keyboard scrubbing after Escape, which ends with mouseleave', () => {
        hoverSeekBar();
        pressKey('Escape');
        // Spatial navigation scrubs with mousemove and stops with mouseleave, without a mouseenter in between
        dispatchMouseEvent(seekBarElement, 'mouseleave');
        dispatchMouseEvent(seekBarElement, 'mousemove');

        expect(label.isShown()).toBe(true);
      });
    });

    it('should not react to Escape after being released', () => {
      hoverSeekBar();
      seekbar.release();

      pressKey('Escape');

      expect(label.isShown()).toBe(true);
    });
  });
});

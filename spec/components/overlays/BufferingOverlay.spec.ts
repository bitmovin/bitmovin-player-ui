import { BufferingOverlay } from '../../../src/ts/components/overlays/BufferingOverlay';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';

describe('BufferingOverlay', () => {
  const showDelayMs = 1000;
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let announceMock: jest.Mock;
  let bufferingOverlay: BufferingOverlay;

  beforeEach(() => {
    jest.useFakeTimers();
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    announceMock = jest.fn();
    uiInstanceManagerMock.announce = announceMock;
    (uiInstanceManagerMock as any).onBufferingShow = MockHelper.getEventDispatcherMock();
    (uiInstanceManagerMock as any).onBufferingHide = MockHelper.getEventDispatcherMock();
  });

  const configureOverlay = () => {
    bufferingOverlay = new BufferingOverlay({ showDelayMs });
    bufferingOverlay.initialize();
    bufferingOverlay.configure(playerMock, uiInstanceManagerMock);
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  const fireStallStarted = () =>
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.StallStarted, timestamp: 0 });
  const fireStallEnded = () =>
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.StallEnded, timestamp: 0 });

  it('should announce buffering when a stall lasts longer than the show delay', () => {
    configureOverlay();
    fireStallStarted();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith('Buffering');
  });

  it('should not announce a stall that ends before the show delay', () => {
    configureOverlay();
    fireStallStarted();
    jest.advanceTimersByTime(showDelayMs - 1);
    fireStallEnded();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).not.toHaveBeenCalled();
  });

  describe('when playback is already stalled at init', () => {
    beforeEach(() => {
      (playerMock.isStalled as jest.Mock).mockReturnValue(true);
      configureOverlay();
    });

    it('should show and announce the stall after the show delay', () => {
      expect(bufferingOverlay.isShown()).toBe(false);

      jest.advanceTimersByTime(showDelayMs);

      expect(bufferingOverlay.isShown()).toBe(true);
      expect(announceMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Buffering');
    });

    it('should announce once when the player also reports the ongoing stall', () => {
      fireStallStarted();
      jest.advanceTimersByTime(showDelayMs * 2);

      expect(announceMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should not announce after it has been released', () => {
    configureOverlay();
    fireStallStarted();
    bufferingOverlay.release();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).not.toHaveBeenCalled();
  });
});

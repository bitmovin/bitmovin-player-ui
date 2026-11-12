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

    bufferingOverlay = new BufferingOverlay({ showDelayMs });
    bufferingOverlay.configure(playerMock, uiInstanceManagerMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const fireStallStarted = () =>
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.StallStarted, timestamp: 0 });
  const fireStallEnded = () =>
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.StallEnded, timestamp: 0 });

  it('should announce buffering when a stall lasts longer than the show delay', () => {
    fireStallStarted();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith('Buffering');
  });

  it('should not announce a stall that ends before the show delay', () => {
    fireStallStarted();
    jest.advanceTimersByTime(showDelayMs - 1);
    fireStallEnded();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).not.toHaveBeenCalled();
  });

  it('should not announce after it has been released', () => {
    fireStallStarted();
    bufferingOverlay.release();
    jest.advanceTimersByTime(showDelayMs);

    expect(announceMock).not.toHaveBeenCalled();
  });
});

import { CastStatusOverlay } from '../../../src/ts/components/overlays/CastStatusOverlay';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';

describe('CastStatusOverlay', () => {
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let announceMock: jest.Mock;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    announceMock = jest.fn();
    uiInstanceManagerMock.announce = announceMock;
    new CastStatusOverlay().configure(playerMock, uiInstanceManagerMock);
  });

  it.each([
    ['Living Room TV', 'Casting to Living Room TV'],
    [undefined, 'Casting started'],
  ])('should announce the start of a cast session on device %p', (deviceName, expectedMessage) => {
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.CastStarted, timestamp: 0, deviceName });

    expect(announceMock).toHaveBeenCalledWith(expectedMessage);
  });

  it('should announce the end of a cast session', () => {
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.CastStopped, timestamp: 0 });

    expect(announceMock).toHaveBeenCalledWith('Casting stopped');
  });

  it('should not announce while connecting, which the cast button already conveys', () => {
    playerMock.eventEmitter.fireEvent({
      type: playerMock.exports.PlayerEvent.CastWaitingForDevice,
      timestamp: 0,
      castPayload: { deviceName: 'Living Room TV' },
    });

    expect(announceMock).not.toHaveBeenCalled();
  });
});

import { AdSkipButton } from '../../../src/ts/components/ads/AdSkipButton';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';

describe('AdSkipButton', () => {
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let announceMock: jest.Mock;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    announceMock = jest.fn();
    uiInstanceManagerMock.announce = announceMock;
    const adSkipButton = new AdSkipButton();
    // The label lookup needs the build-time CSS prefix, which unit tests do not have
    jest.spyOn(adSkipButton, 'setText').mockImplementation(() => undefined);
    adSkipButton.configure(playerMock, uiInstanceManagerMock);
  });

  const playAt = (time: number) => {
    (playerMock.getCurrentTime as jest.Mock).mockReturnValue(time);
    playerMock.eventEmitter.fireEvent({ type: playerMock.exports.PlayerEvent.TimeChanged, timestamp: 0, time });
  };

  it('should announce once when the ad becomes skippable', () => {
    (playerMock.getCurrentTime as jest.Mock).mockReturnValue(0);
    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: 5 });
    playAt(4);

    expect(announceMock).not.toHaveBeenCalled();

    playAt(5);
    playAt(6);

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith('You can skip the ad now');
  });

  it('should announce again for the next skippable ad', () => {
    (playerMock.getCurrentTime as jest.Mock).mockReturnValue(0);
    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: 0 });
    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: 0 });

    expect(announceMock).toHaveBeenCalledTimes(2);
  });

  it('should not announce for an ad that cannot be skipped', () => {
    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: -1 });
    playAt(30);

    expect(announceMock).not.toHaveBeenCalled();
  });
});

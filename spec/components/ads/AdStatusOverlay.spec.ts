import { AdStatusOverlay } from '../../../src/ts/components/ads/AdStatusOverlay';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';

describe('AdStatusOverlay', () => {
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let announceMock: jest.Mock;
  let adBreakTrackerMock: { currentAdIndex: number; totalNumberOfAds: number };

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    announceMock = jest.fn();
    uiInstanceManagerMock.announce = announceMock;
    adBreakTrackerMock = { currentAdIndex: 0, totalNumberOfAds: 0 };
    (uiInstanceManagerMock.getConfig() as any).adBreakTracker = adBreakTrackerMock;

    new AdStatusOverlay().configure(playerMock, uiInstanceManagerMock);
  });

  it.each([
    [1, 1, 'Ad started'],
    [0, 0, 'Ad started'],
    [1, 2, 'Ad 1 of 2 started'],
    [3, 3, 'Ad 3 of 3 started'],
  ])('should announce ad %p of %p as %p', (currentAdIndex, totalNumberOfAds, expectedMessage) => {
    adBreakTrackerMock.currentAdIndex = currentAdIndex;
    adBreakTrackerMock.totalNumberOfAds = totalNumberOfAds;

    playerMock.eventEmitter.fireAdStartedEvent();

    expect(announceMock).toHaveBeenCalledWith(expectedMessage, expect.anything());
  });

  it.each([
    ['its id', { id: 'ad-1' }, 'ad-1'],
    ['the ad object without an id', { id: undefined }, undefined],
  ])('should announce the start once per ad, identified by %s', (_, adData, expectedSubject) => {
    playerMock.eventEmitter.fireAdStartedEvent(adData);

    const [, options] = announceMock.mock.calls[0];
    expect(options.oncePer.topic).toBe('adStarted');
    if (expectedSubject === undefined) {
      expect(options.oncePer.subject).toMatchObject({ isLinear: true });
    } else {
      expect(options.oncePer.subject).toBe(expectedSubject);
    }
  });

  it('should not announce a non-linear ad', () => {
    playerMock.eventEmitter.fireAdStartedEvent({ isLinear: false });

    expect(announceMock).not.toHaveBeenCalled();
  });
});

import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdCounterLabel } from '../../../src/ts/components/ads/AdCounterLabel';
import { AdBreakTrackerAdCountChangedArgs } from '../../../src/ts/utils/AdBreakTracker';
import { EventDispatcher } from '../../../src/ts/EventDispatcher';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adCounterLabel: AdCounterLabel;
let adCountChangedDispatcher: EventDispatcher<any, AdBreakTrackerAdCountChangedArgs>;

describe('AdCounterLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    adCountChangedDispatcher = new EventDispatcher<any, AdBreakTrackerAdCountChangedArgs>();

    const adBreakTrackerMock = {
      onAdCountChanged: adCountChangedDispatcher.getEvent(),
      currentAdIndex: 0,
      totalNumberOfAds: 0,
      release: jest.fn(),
    };

    const config = uiInstanceManagerMock.getConfig();
    (config as any).adBreakTracker = adBreakTrackerMock;

    adCounterLabel = new AdCounterLabel({ adCountOutOfTotal: 'Ad {activeAdIndex} of {totalAdsCount}' });
    adCounterLabel.configure(playerMock, uiInstanceManagerMock);
  });

  it('shows the ad counter text when onAdCountChanged fires', () => {
    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
  });

  it('updates text when onAdCountChanged fires again with new values', () => {
    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 2, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 2 of 3');
  });

  it('clears text on AdBreakStarted', () => {
    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 2 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 2');

    playerMock.eventEmitter.fireAdBreakStartedEvent(5, []);
    expect(adCounterLabel.getText()).toBe('');
  });

  it('clears text on AdBreakFinished', () => {
    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 1 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 1');

    playerMock.eventEmitter.fireAdBreakFinishedEvent({ id: 'break-1', scheduleTime: 5, ads: [] } as any);
    expect(adCounterLabel.getText()).toBe('');
  });

  it('shows 0 of 0 when tracker reports reset values', () => {
    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 0, totalNumberOfAds: 0 });
    expect(adCounterLabel.getText()).toBe('Ad 0 of 0');
  });
});

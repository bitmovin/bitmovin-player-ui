import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdCounterLabel, AdCounterLabelConfig } from '../../../src/ts/components/ads/AdCounterLabel';
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
  });

  it('shows the ad counter text when onAdCountChanged fires', () => {
    configureAdCounterLabel();

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
  });

  it('updates text when onAdCountChanged fires again with new values', () => {
    configureAdCounterLabel();

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 2, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Ad 2 of 3');
  });

  it('shows empty text when tracker reports reset values', () => {
    configureAdCounterLabel();

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 0, totalNumberOfAds: 0 });
    expect(adCounterLabel.getText()).toBe('');
  });

  it('shows the configured text when the ad break contains only one ad', () => {
    configureAdCounterLabel({ text: 'Advertisement' });

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 1 });
    expect(adCounterLabel.getText()).toBe('Advertisement');
  });

  it('falls back to the default localized text for a single-ad ad break', () => {
    configureAdCounterLabel();

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 1, totalNumberOfAds: 1 });
    expect(adCounterLabel.getText()).toBe('Ad');
  });

  it('uses the ad-specific message for a single-ad ad break', () => {
    configureAdCounterLabel({ text: 'Advertisement' });
    const adBreakTracker = uiInstanceManagerMock.getConfig().adBreakTracker;
    Object.assign(adBreakTracker, { currentAdIndex: 1, totalNumberOfAds: 1 });

    playerMock.eventEmitter.fireAdStartedEvent({ uiConfig: { message: 'Sponsor message' } });

    expect(adCounterLabel.getText()).toBe('Sponsor message');
  });

  it('keeps showing the counter instead of the ad-specific message when multiple ads remain', () => {
    configureAdCounterLabel();
    const adBreakTracker = uiInstanceManagerMock.getConfig().adBreakTracker;
    Object.assign(adBreakTracker, { currentAdIndex: 1, totalNumberOfAds: 3 });

    playerMock.eventEmitter.fireAdStartedEvent({ uiConfig: { message: 'Sponsor message' } });

    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
  });

  it('falls back to the ad message when the current ad index is unavailable', () => {
    configureAdCounterLabel({ text: 'Advertisement' });
    const adBreakTracker = uiInstanceManagerMock.getConfig().adBreakTracker;
    Object.assign(adBreakTracker, { currentAdIndex: 0, totalNumberOfAds: 3 });

    adCountChangedDispatcher.dispatch(null, { currentAdIndex: 0, totalNumberOfAds: 3 });
    expect(adCounterLabel.getText()).toBe('Advertisement');

    playerMock.eventEmitter.fireAdStartedEvent({ uiConfig: { message: 'Sponsor message' } });
    expect(adCounterLabel.getText()).toBe('Sponsor message');
  });
});

function configureAdCounterLabel(config: AdCounterLabelConfig = {}) {
  adCounterLabel = new AdCounterLabel({
    adCountOutOfTotal: 'Ad {activeAdIndex} of {totalAdsCount}',
    ...config,
  });
  adCounterLabel.configure(playerMock, uiInstanceManagerMock);
}

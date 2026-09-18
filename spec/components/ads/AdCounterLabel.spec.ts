import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdCounterLabel, AdCounterLabelConfig } from '../../../src/ts/components/ads/AdCounterLabel';
import { AdBreakTracker, AdBreakTrackerAdCountChangedArgs } from '../../../src/ts/utils/AdBreakTracker';
import { EventDispatcher } from '../../../src/ts/EventDispatcher';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adCounterLabel: AdCounterLabel;
let adCountChangedDispatcher: EventDispatcher<any, AdBreakTrackerAdCountChangedArgs>;
let adBreakTrackerMock: AdBreakTracker;

describe('AdCounterLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    adCountChangedDispatcher = new EventDispatcher<any, AdBreakTrackerAdCountChangedArgs>();

    adBreakTrackerMock = {
      onAdCountChanged: adCountChangedDispatcher.getEvent(),
      currentAdIndex: 0,
      totalNumberOfAds: 0,
      release: jest.fn(),
    } as unknown as AdBreakTracker;

    const config = uiInstanceManagerMock.getConfig();
    (config as any).adBreakTracker = adBreakTrackerMock;
  });

  it('shows the ad counter text when onAdCountChanged fires', () => {
    configureAdCounterLabel();

    emitAdCountChanged(1, 3);
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
  });

  it('updates text when onAdCountChanged fires again with new values', () => {
    configureAdCounterLabel();

    emitAdCountChanged(1, 3);
    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');

    emitAdCountChanged(2, 3);
    expect(adCounterLabel.getText()).toBe('Ad 2 of 3');
  });

  it('shows empty text when tracker reports reset values', () => {
    configureAdCounterLabel();

    emitAdCountChanged(0, 0);
    expect(adCounterLabel.getText()).toBe('');
  });

  it('shows the configured text when the ad break contains only one ad', () => {
    configureAdCounterLabel({ text: 'Advertisement' });

    emitAdCountChanged(1, 1);
    expect(adCounterLabel.getText()).toBe('Advertisement');
  });

  it('falls back to the default localized text for a single-ad ad break', () => {
    configureAdCounterLabel();

    emitAdCountChanged(1, 1);
    expect(adCounterLabel.getText()).toBe('Ad');
  });

  it('uses the tracker counts in the configured single-ad message', () => {
    configureAdCounterLabel({ text: 'Advertisement {activeAdIndex} of {totalAdsCount}' });

    emitAdCountChanged(1, 1);

    expect(adCounterLabel.getText()).toBe('Advertisement 1 of 1');
  });

  it('keeps the regular message during an excluded ad even when no ads are counted', () => {
    configureAdCounterLabel({ text: 'Advertisement' });
    playerMock.ads.getActiveAd = jest.fn().mockReturnValue({ id: 'bumper-intro' });

    emitAdCountChanged(0, 0);

    expect(adCounterLabel.getText()).toBe('Advertisement');
  });

  it('uses the ad-specific message for a single-ad ad break', () => {
    configureAdCounterLabel({ text: 'Advertisement' });
    setAdCount(1, 1);

    playerMock.eventEmitter.fireAdStartedEvent({ uiConfig: { message: 'Sponsor message' } });

    expect(adCounterLabel.getText()).toBe('Sponsor message');
  });

  it('keeps showing the counter instead of the ad-specific message when multiple ads remain', () => {
    configureAdCounterLabel();
    setAdCount(1, 3);

    playerMock.eventEmitter.fireAdStartedEvent({ uiConfig: { message: 'Sponsor message' } });

    expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
  });

  it('falls back to the ad message when the current ad index is unavailable', () => {
    configureAdCounterLabel({ text: 'Advertisement' });

    emitAdCountChanged(0, 3);
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

function setAdCount(currentAdIndex: number, totalNumberOfAds: number) {
  Object.assign(adBreakTrackerMock, { currentAdIndex, totalNumberOfAds });
}

function emitAdCountChanged(currentAdIndex: number, totalNumberOfAds: number) {
  setAdCount(currentAdIndex, totalNumberOfAds);
  adCountChangedDispatcher.dispatch(adBreakTrackerMock, { currentAdIndex, totalNumberOfAds });
}

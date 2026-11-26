import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdMessageLabel } from '../../../src/ts/components/ads/AdMessageLabel';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adMessageLabel: AdMessageLabel;

describe('AdMessageLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  });

  describe('message text precedence', () => {
    const configText = 'Config message';

    beforeEach(() => {
      adMessageLabel = new AdMessageLabel({ text: configText });

      adMessageLabel.configure(playerMock, uiInstanceManagerMock);
    });

    it('uses text from LinearAd uiConfig.message over config.text', () => {
      const adUiConfigMessage = 'Ad-specific message';

      playerMock.eventEmitter.fireAdStartedEvent({
        uiConfig: {
          message: adUiConfigMessage,
        },
      });

      expect(adMessageLabel.getText()).toEqual(adUiConfigMessage);
    });

    it('falls back to config.text when LinearAd has no uiConfig.message', () => {
      playerMock.eventEmitter.fireAdStartedEvent({});

      expect(adMessageLabel.getText()).toEqual(configText);
    });
  });

  describe('ad count placeholders', () => {
    beforeEach(() => {
      adMessageLabel = new AdMessageLabel({ text: 'Ad {activeAdIndex} of {totalAdsCount}' });
    });

    it('fills the placeholders from the ad break tracker', () => {
      (uiInstanceManagerMock.getConfig() as any).adBreakTracker = { currentAdIndex: 2, totalNumberOfAds: 5 };
      adMessageLabel.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.fireAdStartedEvent({});

      expect(adMessageLabel.getText()).toEqual('Ad 2 of 5');
    });

    it('renders zero counts when no tracker is available', () => {
      adMessageLabel.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.fireAdStartedEvent({});

      expect(adMessageLabel.getText()).toEqual('Ad 0 of 0');
    });
  });
});

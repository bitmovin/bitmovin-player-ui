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

  it('filters the break countdown without changing ordinary counts or per-ad timing', () => {
    const ads = [
      { id: 'ad-1', isLinear: true, duration: 10 },
      { id: 'bumper', isLinear: true, duration: 2 },
    ];
    uiInstanceManagerMock.getConfig().adCountFilter = ad => ad?.id !== 'bumper';
    playerMock.ads.getActiveAd = jest.fn().mockReturnValue(ads[0]);
    playerMock.ads.getActiveAdBreak = jest.fn().mockReturnValue({ ads });
    playerMock.ads.isLinearAdActive = jest.fn().mockReturnValue(true);
    (playerMock.getCurrentTime as jest.Mock).mockReturnValue(3);
    (playerMock.getDuration as jest.Mock).mockReturnValue(10);
    adMessageLabel = new AdMessageLabel({
      text: 'Ad {activeAdIndex} of {totalAdsCount}: {adBreakRemainingTime}, ad {remainingTime}',
    });
    adMessageLabel.configure(playerMock, uiInstanceManagerMock);

    playerMock.eventEmitter.fireAdStartedEvent(ads[0]);

    expect(adMessageLabel.getText()).toEqual('Ad 1 of 2: 7, ad 7');
  });
});

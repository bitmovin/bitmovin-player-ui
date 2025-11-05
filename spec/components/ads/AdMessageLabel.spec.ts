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
});

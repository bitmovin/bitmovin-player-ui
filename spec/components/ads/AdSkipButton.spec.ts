import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdSkipButton } from '../../../src/ts/components/ads/AdSkipButton';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adSkipButton: AdSkipButton;

describe('AdSkipButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    (playerMock.getCurrentTime as jest.Mock).mockReturnValue(0);

    adSkipButton = new AdSkipButton({
      untilSkippableMessage: 'Ad {activeAdIndex} of {totalAdsCount}: skip in {remainingTime}',
    });
  });

  describe('ad count placeholders', () => {
    it('fills the placeholders from the ad break tracker', () => {
      (uiInstanceManagerMock.getConfig() as any).adBreakTracker = { currentAdIndex: 2, totalNumberOfAds: 5 };
      adSkipButton.configure(playerMock, uiInstanceManagerMock);
      // The button text is rendered through the DOM, whose CSS prefix is only replaced in a build
      const setTextSpy = jest.spyOn(adSkipButton, 'setText').mockImplementation(() => undefined);

      playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: 5 });

      expect(setTextSpy).toHaveBeenCalledWith('Ad 2 of 5: skip in 5');
    });

    it('renders zero counts when no tracker is available', () => {
      adSkipButton.configure(playerMock, uiInstanceManagerMock);
      const setTextSpy = jest.spyOn(adSkipButton, 'setText').mockImplementation(() => undefined);

      playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter: 5 });

      expect(setTextSpy).toHaveBeenCalledWith('Ad 0 of 0: skip in 5');
    });
  });
});

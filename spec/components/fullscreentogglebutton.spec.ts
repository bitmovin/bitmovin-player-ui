import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { FullscreenToggleButton } from '../../src/ts/components/fullscreentogglebutton';
import { PlayerEvent, ViewMode } from 'bitmovin-player';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let fullscreenToggleButton: FullscreenToggleButton;

describe('FullscreenToggleButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    fullscreenToggleButton = new FullscreenToggleButton();
    fullscreenToggleButton.initialize();

    // Setup DOM Mock
    const mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(fullscreenToggleButton, 'getDomElement').mockReturnValue(mockDomElement);
  });

  describe('is visible', () => {
    it('when fullscreen is available', () => {
      jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);

      fullscreenToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(fullscreenToggleButton.isHidden()).toBe(false);
    });
  });

  describe('is hidden', () => {
    it('when fullscreen is not available', () => {
      jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);

      fullscreenToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(fullscreenToggleButton.isHidden()).toBe(true);
    });
  });

  describe('a change of fullscreen availability', () => {
    beforeEach(() => {
      // This is needed as the event is not yet part of the PlayerAPI
      // @ts-ignore
      playerMock.exports = {
        PlayerEvent: {
          ViewModeChanged: 'viewmodechanged',
          ViewModeAvailabilityChanged: 'viewmodeavailabilitychanged',
        },
        ViewMode: {
          Fullscreen: 'fullscreen',
        },
      } as any;
    });

    describe('when it becomes unavailable', () => {
      it('hides the button', () => {
        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);

        fullscreenToggleButton.configure(playerMock, uiInstanceManagerMock);

        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);
        playerMock.eventEmitter.fireViewModeAvailabilityChangedEvent(ViewMode.Fullscreen, false);

        expect(fullscreenToggleButton.isHidden()).toBe(true);
      });
    });

    describe('when it becomes available', () => {
      it('shows the button', () => {
        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);

        fullscreenToggleButton.configure(playerMock, uiInstanceManagerMock);

        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);
        playerMock.eventEmitter.fireViewModeAvailabilityChangedEvent(ViewMode.Fullscreen, true);

        expect(fullscreenToggleButton.isHidden()).toBe(false);
      });
    });
  });
});

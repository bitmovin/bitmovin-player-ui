import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { FullscreenToggleButton } from '../../src/ts/components/fullscreentogglebutton';

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
});

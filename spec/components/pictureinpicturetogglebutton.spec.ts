import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { PictureInPictureToggleButton } from '../../src/ts/components/pictureInPicturetogglebutton';
import { ViewMode } from 'bitmovin-player';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let pictureInPictureToggleButton: PictureInPictureToggleButton;

describe('PictureInPictureToggleButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    pictureInPictureToggleButton = new PictureInPictureToggleButton();
    pictureInPictureToggleButton.initialize();

    // Setup DOM Mock
    const mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(pictureInPictureToggleButton, 'getDomElement').mockReturnValue(mockDomElement);
  });

  describe('is visible', () => {
    it('when pictureInPicture is available', () => {
      jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);

      pictureInPictureToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(pictureInPictureToggleButton.isHidden()).toBe(false);
    });
  });

  describe('is hidden', () => {
    it('when pictureInPicture is not available', () => {
      jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);

      pictureInPictureToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(pictureInPictureToggleButton.isHidden()).toBe(true);
    });
  });

  describe('a change of pictureInPicture availability', () => {
    beforeEach(() => {
      // This is needed as the event is not yet part of the PlayerAPI
      // @ts-ignore
      playerMock.exports = {
        PlayerEvent: {
          ViewModeChanged: 'viewmodechanged',
          ViewModeAvailabilityChanged: 'viewmodeavailabilitychanged',
        },
        ViewMode: {
          PictureInPicture: 'pictureInPicture',
        },
      } as any;
    });

    describe('when it becomes unavailable', () => {
      it('hides the button', () => {
        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);

        pictureInPictureToggleButton.configure(playerMock, uiInstanceManagerMock);

        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);
        playerMock.eventEmitter.fireViewModeAvailabilityChangedEvent(ViewMode.PictureInPicture, false);

        expect(pictureInPictureToggleButton.isHidden()).toBe(true);
      });
    });

    describe('when it becomes available', () => {
      it('shows the button', () => {
        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(false);

        pictureInPictureToggleButton.configure(playerMock, uiInstanceManagerMock);

        jest.spyOn(playerMock, 'isViewModeAvailable').mockReturnValue(true);
        playerMock.eventEmitter.fireViewModeAvailabilityChangedEvent(ViewMode.PictureInPicture, true);

        expect(pictureInPictureToggleButton.isHidden()).toBe(false);
      });
    });
  });
});

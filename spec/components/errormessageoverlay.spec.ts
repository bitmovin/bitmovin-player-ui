import { UIInstanceManager } from './../../src/ts/uimanager';
import { ErrorMessageOverlay } from '../../src/ts/components/errormessageoverlay';
import { MobileV3PlayerEvent } from '../../src/ts/mobilev3playerapi';
import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';

describe('ErrorMessageOverlay', () => {
  describe('configure', () => {
    let errorMessageOverlay: ErrorMessageOverlay;
    let playerMock: TestingPlayerAPI;
    let uiInstanceManagerMock: UIInstanceManager;
  
    beforeEach(() => {
      errorMessageOverlay = new ErrorMessageOverlay({});
      playerMock = MockHelper.getPlayerMock();
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    });
  
    it('adds an event listener for source loaded event', () => {
      const onSpy = jest.spyOn(playerMock, 'on');
      errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(onSpy).toHaveBeenCalledWith(playerMock.exports.PlayerEvent.SourceLoaded, expect.any(Function));
    });

    it('adds an event listener for error event when not mobile v3', () => {
      const onSpy = jest.spyOn(playerMock, 'on');
      errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);

      expect(onSpy).toHaveBeenCalledWith(playerMock.exports.PlayerEvent.Error, expect.any(Function));
    });

    describe('mobile v3 handling', () => {
      let onSpy: jest.SpyInstance;

      beforeEach(() => {
        onSpy = jest.spyOn(playerMock, 'on');

        (playerMock.exports.PlayerEvent as any).SourceError = MobileV3PlayerEvent.SourceError;
        (playerMock.exports.PlayerEvent as any).PlayerError = MobileV3PlayerEvent.PlayerError;
        (playerMock.exports.PlayerEvent as any).PlaylistTransition = MobileV3PlayerEvent.PlaylistTransition;
      });

      it('adds an event listener for sourceerror and playererror when mobile v3', () => {
        errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);
  
        expect(onSpy).toHaveBeenCalledWith(MobileV3PlayerEvent.PlayerError, expect.any(Function));
        expect(onSpy).toHaveBeenCalledWith(MobileV3PlayerEvent.SourceError, expect.any(Function));
      });
  
      it('uses message from the error event when mobile v3', () => {  
        const setTextSpy = jest.spyOn(errorMessageOverlay['errorLabel'], 'setText');
  
        errorMessageOverlay['tvNoiseBackground'] = { start: () => {} } as any;
  
        errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);
  
        const playerErrorEvent = {
          type: MobileV3PlayerEvent.PlayerError,
          message: 'this is a player error',
        };
        playerMock.eventEmitter.fireEvent<any>(playerErrorEvent);
  
        expect(onSpy).toHaveBeenCalledWith(MobileV3PlayerEvent.PlayerError, expect.any(Function));
        expect(setTextSpy).toHaveBeenCalledWith(playerErrorEvent.message);
      });
    });
  });
});

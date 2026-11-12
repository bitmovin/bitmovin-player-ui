import { UIInstanceManager } from '../../../src/ts/UIManager';
import { ErrorMessageOverlay } from '../../../src/ts/components/overlays/ErrorMessageOverlay';
import { MobileV3PlayerEvent } from '../../../src/ts/utils/MobileV3PlayerAPI';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { BrowserUtils } from '../../../src/ts/utils/BrowserUtils';

describe('ErrorMessageOverlay', () => {
  describe('configure', () => {
    let errorMessageOverlay: ErrorMessageOverlay;
    let playerMock: TestingPlayerAPI;
    let uiInstanceManagerMock: UIInstanceManager;

    beforeEach(() => {
      jest.spyOn(BrowserUtils, 'isTizen', 'get').mockReturnValue(false);
      errorMessageOverlay = new ErrorMessageOverlay({});
      playerMock = MockHelper.getPlayerMock();
      uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const fireUnknownError = () =>
      playerMock.eventEmitter.fireEvent<any>({
        type: playerMock.exports.PlayerEvent.Error,
        code: 1000,
        name: 'UNKNOWN_ERROR',
        timestamp: 0,
      });

    describe('on Tizen', () => {
      let announceMock: jest.Mock;

      beforeEach(() => {
        jest.spyOn(BrowserUtils, 'isTizen', 'get').mockReturnValue(true);
        errorMessageOverlay = new ErrorMessageOverlay({});
        errorMessageOverlay['tvNoiseBackground'] = { start: () => {} } as any;
        announceMock = jest.fn();
        uiInstanceManagerMock.announce = announceMock;
      });

      it('should keep the status role that Tizen text-to-speech reads', () => {
        expect(errorMessageOverlay.getDomElement().attr('role')).toBe('status');
      });

      it('should show the error without also announcing it through the alert region', () => {
        errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);

        fireUnknownError();

        expect(errorMessageOverlay.isShown()).toBe(true);
        expect(announceMock).not.toHaveBeenCalled();
      });
    });

    it('should not be a live region itself, so the error is not announced twice', () => {
      const role = errorMessageOverlay.getDomElement().attr('role');

      expect(['alert', 'status', 'log']).not.toContain(role);
      expect(errorMessageOverlay.getDomElement().attr('aria-live')).toBeNull();
    });

    it('should announce the displayed error assertively once the overlay is shown', () => {
      const shownWhenAnnounced: boolean[] = [];
      const announceMock = jest.fn(() => shownWhenAnnounced.push(errorMessageOverlay.isShown()));
      uiInstanceManagerMock.announce = announceMock;
      errorMessageOverlay['tvNoiseBackground'] = { start: () => {} } as any;
      errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.fireEvent<any>({
        type: playerMock.exports.PlayerEvent.Error,
        code: 1000,
        name: 'UNKNOWN_ERROR',
        timestamp: 0,
      });

      expect(announceMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Error is unknown\n(UNKNOWN_ERROR)', { assertive: true });
      expect(shownWhenAnnounced).toEqual([true]);
    });

    it.each([
      ['markup', 'Try again <ul><li>later</li></ul>', 'Try again\nlater'],
      ['paragraphs', '<p>License expired</p><p>Contact support</p>', 'License expired\nContact support'],
      [
        'list items and line breaks',
        '<p>Try:</p><ul><li>Reload</li><li>Another <b>browser</b></li></ul>Code<br>1000',
        'Try:\nReload\nAnother browser\nCode\n1000',
      ],
    ])('should announce the text the label renders for a custom message with %s', (_, message, expected) => {
      const announceMock = jest.fn();
      uiInstanceManagerMock.announce = announceMock;
      errorMessageOverlay = new ErrorMessageOverlay({ messages: { 1000: message } });
      errorMessageOverlay['tvNoiseBackground'] = { start: () => {} } as any;
      errorMessageOverlay.getDomElement();
      errorMessageOverlay.configure(playerMock, uiInstanceManagerMock);

      playerMock.eventEmitter.fireEvent<any>({
        type: playerMock.exports.PlayerEvent.Error,
        code: 1000,
        name: 'UNKNOWN_ERROR',
        timestamp: 0,
      });

      expect(announceMock).toHaveBeenCalledWith(expected, { assertive: true });
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

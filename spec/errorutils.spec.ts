import { MobileV3PlayerErrorEvent } from '../src/ts/mobilev3playerapi';
import { ErrorUtils } from '../src/ts/errorutils';
import defaultMobileV3ErrorMessageTranslator = ErrorUtils.defaultMobileV3ErrorMessageTranslator;
import { ErrorEvent } from 'bitmovin-player';
import defaultWebErrorMessageTranslator = ErrorUtils.defaultWebErrorMessageTranslator;

describe('ErrorUtils', () => {
  describe('defaultMobileV3ErrorMessageTranslator', () => {
    it('should translate the error event to an error message', () => {
      const errorName = 'onPlayerError';
      const errorMessage = 'something went horribly wrong';
      const playerErrorEvent = { message: errorMessage, name: errorName } as MobileV3PlayerErrorEvent;

      expect(defaultMobileV3ErrorMessageTranslator(playerErrorEvent)).toEqual(`${errorMessage}\n(${errorName})`);
    });
  });

  describe('defaultWebErrorMessageTranslator', () => {
    it('should map the error code to the error message and return it', () => {
      const errorCode = 2100;
      const errorName = 'player-error';
      const errorEvent = { code: errorCode, name: errorName } as ErrorEvent;
      const expectedErrorMessage = ErrorUtils.defaultErrorMessages[errorCode];

      expect(defaultWebErrorMessageTranslator(errorEvent)).toEqual(`${expectedErrorMessage}\n(${errorName})`);
    });

    it('should fall back to returning the error code and name if the associated error message could not be found', () => {
      const errorCode = 9999;
      const errorName = 'unknown-error';
      const errorEvent = { code: errorCode, name: errorName } as ErrorEvent;

      expect(defaultWebErrorMessageTranslator(errorEvent)).toEqual(`${errorCode} ${errorName}`);
    });
  });
});

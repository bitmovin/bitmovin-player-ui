import {ErrorMessageMap, ErrorMessageTranslator} from './components/errormessageoverlay';
import { ErrorEvent } from 'bitmovin-player';
import { MobileV3PlayerErrorEvent, MobileV3SourceErrorEvent } from './mobilev3playerapi';

/**
 * @category Utils
 */
export namespace ErrorUtils {

  export const defaultErrorMessages: ErrorMessageMap = {
    1000: 'Error is unknown',
    1001: 'The player API is not available after a call to PlayerAPI.destroy.',
    1100: 'General setup error',
    1101: 'There was an error when inserting the HTML video element',
    1102: 'No configuration was provided',
    1103: 'The license is not valid',
    1104: 'The the domain-locked player is not authorized to playback on this domain',
    1105: 'The domain is not allowlisted',
    1106: 'The license server URL is invalid',
    1107: 'The impression server URL is invalid',
    1108: 'Could not initialize a rendering engine',
    1109: 'The used flash version does not support playback',
    1110: 'Native Flash is not authorized by a valid Adobe token',
    1111: 'Flash doesn\'t have sufficient resources',
    1112: 'Flash container API not available',
    1113: 'Protocol not supported. This site has been loaded using "file" protocol, but unfortunately this is not supported. Please load the page using a web server (using http or https)',
    1200: 'General source error',
    1201: 'No valid source was provided',
    1202: 'The downloaded manifest is invalid',
    1203: 'There was no technology detected to playback the provided source',
    1204: 'The stream type is not supported',
    1205: 'The forced technology is not supported',
    1206: 'No stream found for supported technologies.',
    1207: 'The downloaded segment is empty',
    1208: 'The manifest could not be loaded',
    1209: 'Progressive stream type not supported or the stream has an error',
    1210: 'HLS stream has an error',
    1211: 'The encryption method is not supported',
    1300: 'General playback error',
    1301: 'Video decoder or demuxer had an error with the content',
    1302: 'General error if Flash renderer has an error',
    1303: 'Flash doesn\'t have sufficient resources',
    1304: 'The transmuxer could not be initialized',
    1400: 'Network error while downloading',
    1401: 'The manifest download timed out',
    1402: 'The segment download timed out',
    1403: 'The progressive stream download timed out',
    1404: 'The Certificate could not be loaded',
    2000: 'General DRM error',
    2001: 'Required DRM configuration is missing',
    2002: 'The licensing server URL is missing',
    2003: 'License request failed',
    2004: 'Key or KeyId is missing',
    2005: 'Key size is not supported',
    2006: 'Unable to instantiate a key system supporting the required combinations',
    2007: 'Unable to create or initialize key session',
    2008: 'The MediaKey object could not be created/initialized',
    2009: 'Key error',
    2010: 'The key system is not supported',
    2011: 'The certificate is not valid',
    2012: 'Invalid header key/value pair for PlayReady license request',
    2013: 'Content cannot be played back because the output is restricted on this machine',
    2014: 'DRM error for the Flash renderer',
    2100: 'General VR error',
    2101: 'Player technology not compatible with VR playback',
    3000: 'General module error',
    3001: 'The definition of the module is invalid (e.g. incomplete).',
    3002: 'The module definition specifies dependencies but the module is not provided via a function for deferred loading.',
    3003: 'A module cannot be loaded because it has not been added to the player core.',
    3004: 'A module cannot be loaded because one or more dependencies are missing.',
    3100: 'An Advertising module error has occurred. Refer to the attached AdvertisingError.',
  };

  export const defaultMobileV3ErrorMessageTranslator = (error: MobileV3PlayerErrorEvent | MobileV3SourceErrorEvent) => {
    return error.message;
  };

  export const defaultWebErrorMessageTranslator: ErrorMessageTranslator = (error: ErrorEvent) => {
    const errorMessage = ErrorUtils.defaultErrorMessages[error.code];

    if (errorMessage) {
      // Use the error message text if there is one
      return `${errorMessage}\n(${error.name})`; // default error message style
    } else {
      // Fallback to error code/name if no message is defined
      return `${error.code} ${error.name}`;
    }
  };
}

import {ErrorMessageMap, ErrorMessageTranslator} from './components/errormessageoverlay';
import ErrorEvent = bitmovin.PlayerAPI.ErrorEvent;

export namespace ErrorUtils {

  export const defaultErrorMessages: ErrorMessageMap = {
    1001: 'The player API is not available after a call to PlayerAPI.destroy.',
    2010: 'The certificate is not valid',
    2002: 'License request failed',
    2013: 'DRM error for the Flash renderer',
    2008: 'Key error',
    2003: 'Key or KeyId is missing',
    2006: 'Unable to create or initialize key session',
    2004: 'Key size is not supported',
    2009: 'The key system is not supported',
    2007: 'The MediaKey object could not be created/initialized',
    2000: 'Required DRM configuration is missing',
    2005: 'Unable to instantiate a key system supporting the required combinations',
    2001: 'The licensing server URL is missing',
    2011: 'Invalid header key/value pair for PlayReady license request',
    2012: 'Content cannot be played back because the output is restricted on this machine',
    3100: 'An Advertising module error has occurred. Refer to the attached AdvertisingError.',
    3003: 'A module cannot be loaded because one or more dependencies are missing.',
    3000: 'The definition of the module is invalid (e.g. incomplete).',
    3001: 'The module definition specifies dependencies but the module is not provided via a function for deferred loading.',
    3002: 'A module cannot be loaded because it has not been added to the player core.',
    1400: 'Network error while downloading',
    1404: 'The Certificate could not be loaded',
    1401: 'The manifest download timed out',
    1403: 'The progressive stream download timed out',
    1402: 'The segment download timed out',
    1301: 'General error if Flash renderer has an error',
    1302: 'Flash doesn\'t have sufficient resources',
    1303: 'The transmuxer could not be initialized',
    1300: 'Video decoder or demuxer had an error with the content',
    1112: 'Flash container API not available',
    1110: 'Native Flash is not authorized by a valid Adobe token',
    1111: 'Flash doesn\'t have sufficient resources',
    1109: 'The used flash version does not support playback',
    1107: 'The impression server URL is invalid',
    1106: 'The license server URL is invalid',
    1103: 'The license is not valid',
    1102: 'No configuration was provided',
    1104: 'The the domain-locked player is not authorized to playback on this domain',
    1105: 'The domain is not whitelisted',
    1100: 'There was an error when inserting the HTML video element',
    1108: 'Could not initialize a rendering engine',
    1101: 'Protocol not supported. This site has been loaded using "file" protocol, but unfortunately this is not supported. Please load the page using a web server (using http or https)',
    1207: 'The manifest could not be loaded',
    1206: 'The downloaded segment is empty',
    1210: 'The encryption method is not supported',
    1204: 'The forced technology is not supported',
    1209: 'HLS stream has an error',
    1200: 'No valid source was provided',
    1201: 'The downloaded manifest is invalid',
    1205: 'No stream found for supported technologies.',
    1202: 'There was no technology detected to playback the provided source',
    1208: 'Progressive stream type not supported or the stream has an error',
    1203: 'The stream type is not supported',
    1000: 'Error is unknown',
    2100: 'Player technology not compatible with VR playback',
  };

  export const defaultErrorMessageTranslator: ErrorMessageTranslator = (error: ErrorEvent) => {
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
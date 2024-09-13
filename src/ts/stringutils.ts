import { Ad, LinearAd, PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';

/**
 * @category Utils
 */
export namespace StringUtils {

  export let FORMAT_HHMMSS: string = 'hh:mm:ss';
  export let FORMAT_MMSS: string = 'mm:ss';

  /**
   * Formats a number of seconds into a time string with the pattern hh:mm:ss.
   *
   * @param totalSeconds the total number of seconds to format to string
   * @param format the time format to output (default: hh:mm:ss)
   * @returns {string} the formatted time string
   */
  export function secondsToTime(totalSeconds: number, format: string = FORMAT_HHMMSS): string {
    let isNegative = totalSeconds < 0;

    if (isNegative) {
      // If the time is negative, we make it positive for the calculation below
      // (else we'd get all negative numbers) and reattach the negative sign later.
      totalSeconds = -totalSeconds;
    }

    // Split into separate time parts
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor(totalSeconds / 60) - hours * 60;
    let seconds = Math.floor(totalSeconds) % 60;

    return (isNegative ? '-' : '') + format
        .replace('hh', leftPadWithZeros(hours, 2))
        .replace('mm', leftPadWithZeros(minutes, 2))
        .replace('ss', leftPadWithZeros(seconds, 2));
  }

  export function secondsToText(totalSeconds: number): string {
    const isNegative = totalSeconds < 0;

    if (isNegative) {
      // If the time is negative, we make it positive for the calculation below
      // (else we'd get all negative numbers) and reattach the negative sign later.
      totalSeconds = -totalSeconds;
    }

    // Split into separate time parts
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) - hours * 60;
    const seconds = Math.floor(totalSeconds) % 60;

    return (isNegative ? '-' : '') +
    (hours !== 0 ? `${leftPadWithZeros(hours, 2)} ${i18n.performLocalization(i18n.getLocalizer('settings.time.hours'))} ` : '') +
    (minutes !== 0 ? `${leftPadWithZeros(minutes, 2)} ${i18n.performLocalization(i18n.getLocalizer('settings.time.minutes'))} ` : '') +
    `${leftPadWithZeros(seconds, 2)} ${i18n.performLocalization(i18n.getLocalizer('settings.time.seconds'))}`;
  }

  /**
   * Converts a number to a string and left-pads it with zeros to the specified length.
   * Example: leftPadWithZeros(123, 5) => '00123'
   *
   * @param num the number to convert to string and pad with zeros
   * @param length the desired length of the padded string
   * @returns {string} the padded number as string
   */
  function leftPadWithZeros(num: number | string, length: number): string {
    let text = num + '';
    let padding = '0000000000'.substr(0, length - text.length);
    return padding + text;
  }

  /**
   * Fills out placeholders in an ad message.
   *
   * Has the placeholders '{remainingTime[formatString]}', '{playedTime[formatString]}',
   * '{adDuration[formatString]}' and {adBreakRemainingTime[formatString]}, which are replaced by the remaining time until the ad can be skipped, the current
   * time or the ad duration. The format string is optional. If not specified, the placeholder is replaced by the time
   * in seconds. If specified, it must be of the following format:
   * - %d - Inserts the time as an integer.
   * - %0Nd - Inserts the time as an integer with leading zeroes, if the length of the time string is smaller than N.
   * - %f - Inserts the time as a float.
   * - %0Nf - Inserts the time as a float with leading zeroes.
   * - %.Mf - Inserts the time as a float with M decimal places. Can be combined with %0Nf, e.g. %04.2f (the time
   * 10.123 would be printed as 0010.12).
   * - %hh:mm:ss
   * - %mm:ss
   *
   * Examples:
   * - { text: 'Ad: {remainingTime%mm:ss} secs' }
   * An input value of 100 would be displayed as: 'Ad: 01:40 secs'
   * - { text: 'Ad: {remainingTime%f} secs' }
   * An input value of 100 would be displayed as: 'Ad: 100.0 secs'
   * - { text: 'Adbreak: {adBreakRemainingTime%f} secs' }
   * Adbreak with 2 ads each 50 seconds would be displayed as: 'Ad: 100.0 secs'
   *
   * @param adMessage an ad message with optional placeholders to fill
   * @param skipOffset if specified, {remainingTime} will be filled with the remaining time until the ad can be skipped
   * @param player the player to get the time data from
   * @returns {string} the ad message with filled placeholders
   */
  export function replaceAdMessagePlaceholders(adMessage: string, skipOffset: number, player: PlayerAPI) {
    let adMessagePlaceholderRegex = new RegExp(
      '\\{(remainingTime|playedTime|adDuration|adBreakRemainingTime)(}|%((0[1-9]\\d*(\\.\\d+(d|f)|d|f)|\\.\\d+f|d|f)|hh:mm:ss|mm:ss)})',
      'g',
    );

    return adMessage.replace(adMessagePlaceholderRegex, (formatString) => {
      let time = 0;
      if (formatString.indexOf('remainingTime') > -1) {
        if (skipOffset) {
          time = Math.ceil(skipOffset - player.getCurrentTime());
        } else {
          time = player.getDuration() - player.getCurrentTime();
        }
      } else if (formatString.indexOf('playedTime') > -1) {
        time = player.getCurrentTime();
      } else if (formatString.indexOf('adDuration') > -1) {
        time = player.getDuration();
      } else if (formatString.indexOf('adBreakRemainingTime') > -1) { // To display the remaining time in the ad break as opposed to in the ad
        time = 0;

        // compute list of ads and calculate duration of remaining ads based on index of active ad
        if (player.ads.isLinearAdActive()) {
          const isActiveAd = (ad: Ad) => player.ads.getActiveAd().id === ad.id;
          const indexOfActiveAd = player.ads.getActiveAdBreak().ads.findIndex(isActiveAd);
          const duration = player.ads.getActiveAdBreak().ads
          .slice(indexOfActiveAd)
          .reduce((total, ad) => total + (ad.isLinear ? (ad as LinearAd).duration : 0), 0);

          // And remaning ads duration minus time played
          time = duration - player.getCurrentTime();
        }
      }

      return formatNumber(Math.round(time), formatString);
    });
  }

  function formatNumber(time: number, format: string) {
    let formatStringValidationRegex = /%((0[1-9]\d*(\.\d+(d|f)|d|f)|\.\d+f|d|f)|hh:mm:ss|mm:ss)/;
    let leadingZeroesRegex = /(%0[1-9]\d*)(?=(\.\d+f|f|d))/;
    let decimalPlacesRegex = /\.\d*(?=f)/;

    if (!formatStringValidationRegex.test(format)) {
      // If the format is invalid, we set a default fallback format
      format = '%d';
    }

    // Determine the number of leading zeros
    let leadingZeroes = 0;
    let leadingZeroesMatches = format.match(leadingZeroesRegex);
    if (leadingZeroesMatches) {
      leadingZeroes = parseInt(leadingZeroesMatches[0].substring(2));
    }

    // Determine the number of decimal places
    let numDecimalPlaces = null;
    let decimalPlacesMatches = format.match(decimalPlacesRegex);
    if (decimalPlacesMatches && !isNaN(parseInt(decimalPlacesMatches[0].substring(1)))) {
      numDecimalPlaces = parseInt(decimalPlacesMatches[0].substring(1));
      if (numDecimalPlaces > 20) {
        numDecimalPlaces = 20;
      }
    }

    // Float format
    if (format.indexOf('f') > -1) {
      let timeString = '';

      if (numDecimalPlaces !== null) {
        // Apply fixed number of decimal places
        timeString = time.toFixed(numDecimalPlaces);
      } else {
        timeString = '' + time;
      }

      // Apply leading zeros
      if (timeString.indexOf('.') > -1) {
        return leftPadWithZeros(timeString, timeString.length + (leadingZeroes - timeString.indexOf('.')));
      } else {
        return leftPadWithZeros(timeString, leadingZeroes);
      }

    }
    // Time format
    else if (format.indexOf(':') > -1) {
      let totalSeconds = Math.ceil(time);

      // hh:mm:ss format
      if (format.indexOf('hh') > -1) {
        return secondsToTime(totalSeconds);
      }
      // mm:ss format
      else {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        return leftPadWithZeros(minutes, 2) + ':' + leftPadWithZeros(seconds, 2);
      }
    }
    // Integer format
    else {
      return leftPadWithZeros(Math.ceil(time), leadingZeroes);
    }
  }
}

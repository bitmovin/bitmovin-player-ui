import {EventDispatcher, Event, NoArgs} from './eventdispatcher';
import {Component, ComponentConfig} from './components/component';
import {Container} from './components/container';

export namespace ArrayUtils {
  /**
   * Removes an item from an array.
   * @param array the array that may contain the item to remove
   * @param item the item to remove from the array
   * @returns {any} the removed item or null if it wasn't part of the array
   */
  export function remove<T>(array: T[], item: T): T | null {
    let index = array.indexOf(item);

    if (index > -1) {
      return array.splice(index, 1)[0];
    } else {
      return null;
    }
  }
}

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
   * Has the placeholders '{remainingTime[formatString]}', '{playedTime[formatString]}' and
   * '{adDuration[formatString]}', which are replaced by the remaining time until the ad can be skipped, the current
   * time or the ad duration. The format string is optional. If not specified, the placeholder is replaced by the time
   * in seconds. If specified, it must be of the following format:
   * - %d - Inserts the time as an integer.
   * - %0Nd - Inserts the time as an integer with leading zeroes, if the length of the time string is smaller than N.
   * - %f - Inserts the time as a float.
   * - %0Nf - Inserts the time as a float with leading zeroes.
   * - %.Mf - Inserts the time as a float with M decimal places. Can be combined with %0Nf, e.g. %04.2f (the time
   * 10.123
   * would be printed as 0010.12).
   * - %hh:mm:ss
   * - %mm:ss
   *
   * @param adMessage an ad message with optional placeholders to fill
   * @param skipOffset if specified, {remainingTime} will be filled with the remaining time until the ad can be skipped
   * @param player the player to get the time data from
   * @returns {string} the ad message with filled placeholders
   */
  export function replaceAdMessagePlaceholders(adMessage: string, skipOffset: number, player: bitmovin.player.Player) {
    let adMessagePlaceholderRegex = new RegExp(
      '\\{(remainingTime|playedTime|adDuration)(}|%((0[1-9]\\d*(\\.\\d+(d|f)|d|f)|\\.\\d+f|d|f)|hh:mm:ss|mm:ss)})',
      'g'
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
      }
      return formatNumber(time, formatString);
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

export namespace PlayerUtils {

  import Player = bitmovin.player.Player;

  export function isSourceLoaded(player: Player): boolean {
    return player.getConfig().source !== undefined;
  }

  export function isTimeShiftAvailable(player: Player): boolean {
    return player.isLive() && player.getMaxTimeShift() !== 0;
  }

  export interface TimeShiftAvailabilityChangedArgs extends NoArgs {
    timeShiftAvailable: boolean;
  }

  export class TimeShiftAvailabilityDetector {

    private timeShiftAvailabilityChangedEvent = new EventDispatcher<Player, TimeShiftAvailabilityChangedArgs>();

    constructor(player: Player) {
      let timeShiftAvailable: boolean = undefined;

      let timeShiftDetector = () => {
        if (player.isLive()) {
          let timeShiftAvailableNow = PlayerUtils.isTimeShiftAvailable(player);

          // When the availability changes, we fire the event
          if (timeShiftAvailableNow !== timeShiftAvailable) {
            this.timeShiftAvailabilityChangedEvent.dispatch(player, { timeShiftAvailable: timeShiftAvailableNow });
            timeShiftAvailable = timeShiftAvailableNow;
          }
        }
      };
      // Try to detect timeshift availability in ON_READY, which works for DASH streams
      player.addEventHandler(player.EVENT.ON_READY, timeShiftDetector);
      // With HLS/NativePlayer streams, getMaxTimeShift can be 0 before the buffer fills, so we need to additionally
      // check timeshift availability in ON_TIME_CHANGED
      player.addEventHandler(player.EVENT.ON_TIME_CHANGED, timeShiftDetector);
    }

    get onTimeShiftAvailabilityChanged(): Event<Player, TimeShiftAvailabilityChangedArgs> {
      return this.timeShiftAvailabilityChangedEvent.getEvent();
    }
  }
}

export namespace UIUtils {
  export interface TreeTraversalCallback {
    (component: Component<ComponentConfig>, parent?: Component<ComponentConfig>): void;
  }

  export function traverseTree(component: Component<ComponentConfig>, visit: TreeTraversalCallback): void {
    let recursiveTreeWalker = (component: Component<ComponentConfig>, parent?: Component<ComponentConfig>) => {
      visit(component, parent);

      // If the current component is a container, visit it's children
      if (component instanceof Container) {
        for (let childComponent of component.getComponents()) {
          recursiveTreeWalker(childComponent, component);
        }
      }
    };

    // Walk and configure the component tree
    recursiveTreeWalker(component);
  }
}
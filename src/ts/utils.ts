/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

export module ArrayUtils {
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

export module StringUtils {

    /**
     * Formats a number of seconds into a time string with the pattern hh:mm:ss.
     *
     * @param totalSeconds the total number of seconds to format to string
     * @returns {string} the formatted time string
     */
    export function secondsToTime(totalSeconds: number): string {
        let isNegative = totalSeconds < 0;

        if(isNegative) {
            // If the time is negative, we make it positive for the calculation below
            // (else we'd get all negative numbers) and reattach the negative sign later.
            totalSeconds = -totalSeconds;
        }

        // Split into separate time parts
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor(totalSeconds / 60) - hours * 60;
        let seconds = Math.floor(totalSeconds) % 60;

        return (isNegative ? "-" : "") + leftPadWithZeros(hours, 2) + ":" + leftPadWithZeros(minutes, 2) + ":" + leftPadWithZeros(seconds, 2);
    }

    /**
     * Converts a number to a string and left-pads it with zeros to the specified length.
     * Example: leftPadWithZeros(123, 5) => "00123"
     *
     * @param number the number to convert to string and pad with zeros
     * @param length the desired length of the padded string
     * @returns {string} the padded number as string
     */
    function leftPadWithZeros(number: number, length: number): string {
        let text = number + "";
        let padding = "0000000000".substr(0, length - text.length);
        return padding + text;
    }
}
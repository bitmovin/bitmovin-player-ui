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
     * Removes an itemConfig from an array.
     * @param array
     * @param item
     * @returns {any}
     */
    export function remove<T>(array: T[], item: T) : T {
        var index = array.indexOf(item);

        if(index > -1) {
            return array.splice(index, 1)[0];
        } else {
            return null;
        }
    }
}
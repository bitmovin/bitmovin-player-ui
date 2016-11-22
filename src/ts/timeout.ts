/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

// TODO change to internal (not exported) class, how to use in other files?
export class Timeout {

    private delay: number;
    private callback: () => void;
    private timeoutHandle: number;

    constructor(delay: number, callback: () => void) {
        this.delay = delay;
        this.callback = callback;
        this.timeoutHandle = 0;
    }

    /**
     * Starts the timeout and calls the callback when the timeout delay has passed.
     */
    start(): void {
        this.reset();
    }

    /**
     * Clears the timeout. The callback will not be called if clear is called during the timeout.
     */
    clear(): void {
        clearTimeout(this.timeoutHandle);
    }

    /**
     * Resets the passed timeout delay to zero. Can be used to defer the calling of the callback.
     */
    reset(): void {
        this.clear();
        this.timeoutHandle = setTimeout(this.callback, this.delay);
    }
}
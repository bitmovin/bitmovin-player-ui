/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

// TODO change to internal (not exported) class, how to use in other files?
/**
 * Executes a callback after a specified amount of time, optionally repeatedly until stopped.
 */
export class Timeout {

    private delay: number;
    private callback: () => void;
    private repeat: boolean;
    private timeoutHandle: number;

    /**
     * Creates a new timeout callback handler.
     * @param delay the delay in milliseconds after which the callback should be executed
     * @param callback the callback to execute after the delay time
     * @param repeat if true, call the callback repeatedly in delay intervals
     */
    constructor(delay: number, callback: () => void, repeat: boolean = false) {
        this.delay = delay;
        this.callback = callback;
        this.repeat = repeat;
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
        let self = this;

        this.clear();

        let internalCallback = function () {
            self.callback();

            if (self.repeat) {
                self.timeoutHandle = setTimeout(internalCallback, self.delay);
            }
        };

        this.timeoutHandle = setTimeout(internalCallback, this.delay);
    }
}
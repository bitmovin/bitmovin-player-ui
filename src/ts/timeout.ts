// TODO change to internal (not exported) class, how to use in other files?
/**
 * Executes a callback after a specified amount of time, optionally repeatedly until stopped.
 */
export class Timeout {

  private readonly delay: number;
  private readonly callback: () => void;
  private readonly repeat: boolean;
  // There's two setTimeout declarations, one on Window which returns type "number" and one in NodeJS which returns
  // type "Timer". For unknown reasons builds on Jenkins fail due to a type mismatch when we use type "number" here,
  // although it works on other platforms (e.g. Windows, Codeship).
  // To work around the issue we use type "any". The type does not matter anyway because we're not working with
  // this value except providing it to clearTimeout.
  private timeoutOrIntervalId: any;
  private active: boolean;
  private suspended: boolean;

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
    this.timeoutOrIntervalId = 0;
    this.active = false;
    this.suspended = false;
  }

  /**
   * Starts the timeout and calls the callback when the timeout delay has passed. Has no effect when the timeout is
   * suspended.
   * @returns {Timeout} the current timeout (so the start call can be chained to the constructor)
   */
  start(): this {
    this.reset();
    return this;
  }

  /**
   * Clears the timeout. The callback will not be called if clear is called during the timeout.
   */
  clear(): void {
    this.clearInternal();
  }

  /**
   * Suspends the timeout. The callback will not be called and calls to `start` and `reset` will be ignored until the
   * timeout is resumed.
   */
  suspend() {
    this.suspended = true;
    this.clearInternal();

    return this;
  }

  /**
   * Resumes the timeout.
   * @param reset whether to reset the timeout after resuming
   */
  resume(reset: boolean) {
    this.suspended = false;

    if (reset) {
      this.reset();
    }

    return this;
  }

  /**
   * Resets the passed timeout delay to zero. Can be used to defer the calling of the callback. Has no effect if the
   * timeout is suspended.
   */
  reset(): void {
    this.clearInternal();

    if (this.suspended) {
      return;
    }

    if (this.repeat) {
      this.timeoutOrIntervalId = setInterval(this.callback, this.delay);
    } else {
      this.timeoutOrIntervalId = setTimeout(() => {
        this.active = false;
        this.callback();
      }, this.delay);
    }
    this.active = true;
  }

  isActive(): boolean {
    return this.active;
  }

  private clearInternal(): void {
    if (this.repeat) {
      clearInterval(this.timeoutOrIntervalId);
    } else {
      clearTimeout(this.timeoutOrIntervalId);
    }
    this.active = false;
  }
}
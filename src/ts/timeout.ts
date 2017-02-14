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
    let lastScheduleTime = 0;
    let delayAdjust = 0;

    this.clear();

    let internalCallback = () => {
      this.callback();

      if (this.repeat) {
        let now = Date.now();

        // The time of one iteration from scheduling to executing the callback (usually a bit longer than the delay
        // time)
        let delta = now - lastScheduleTime;

        // Calculate the delay adjustment for the next schedule to keep a steady delay interval over time
        delayAdjust = this.delay - delta + delayAdjust;

        lastScheduleTime = now;

        // Schedule next execution by the adjusted delay
        this.timeoutHandle = setTimeout(internalCallback, this.delay + delayAdjust);
      }
    };

    lastScheduleTime = Date.now();
    this.timeoutHandle = setTimeout(internalCallback, this.delay);
  }
}
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
  private running: boolean;

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
    this.running = false;
  }

  /**
   * Starts the timeout and calls the callback when the timeout delay has passed.
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
   * Resets the passed timeout delay to zero. Can be used to defer the calling of the callback.
   */
  reset(): void {
    this.clearInternal();

    if (this.repeat) {
      this.timeoutOrIntervalId = setInterval(this.callback, this.delay);
    } else {
      this.timeoutOrIntervalId = setTimeout(this.callback, this.delay);
    }
    this.running = true;
  }

  isRunning(): boolean {
    return this.running;
  }

  private clearInternal(): void {
    if (this.repeat) {
      clearInterval(this.timeoutOrIntervalId);
    } else {
      clearTimeout(this.timeoutOrIntervalId);
    }
    this.running = false;
  }
}
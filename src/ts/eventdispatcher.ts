import {ArrayUtils} from './arrayutils';
/**
 * Function interface for event listeners on the {@link EventDispatcher}.
 */
export interface EventListener<Sender, Args> {
  (sender: Sender, args: Args): void;
}

/**
 * Empty type for creating {@link EventDispatcher event dispatchers} that do not carry any arguments.
 */
export interface NoArgs {
}

/**
 * Event args for an event that can be canceled.
 */
export interface CancelEventArgs extends NoArgs {
  /**
   * Gets or sets a flag whether the event should be canceled.
   */
  cancel?: boolean;
}

/**
 * Public interface that represents an event. Can be used to subscribe to and unsubscribe from events.
 */
export interface Event<Sender, Args> {
  /**
   * Subscribes an event listener to this event dispatcher.
   * @param listener the listener to add
   */
  subscribe(listener: EventListener<Sender, Args>): void;

  /**
   * Subscribes an event listener to this event dispatcher that is only called once.
   * @param listener the listener to add
   */
  subscribeOnce(listener: EventListener<Sender, Args>): void;

  /**
   * Subscribes an event listener to this event dispatcher that will be called at a limited rate with a minimum
   * interval of the specified milliseconds.
   * @param listener the listener to add
   * @param rateMs the rate in milliseconds to which calling of the listeners should be limited
   */
  subscribeRateLimited(listener: EventListener<Sender, Args>, rateMs: number): void;

  /**
   * Unsubscribes a subscribed event listener from this dispatcher.
   * @param listener the listener to remove
   * @returns {boolean} true if the listener was successfully unsubscribed, false if it isn't subscribed on this
   *   dispatcher
   */
  unsubscribe(listener: EventListener<Sender, Args>): boolean;
}

/**
 * Event dispatcher to subscribe and trigger events. Each event should have its own dispatcher.
 */
export class EventDispatcher<Sender, Args> implements Event<Sender, Args> {

  private listeners: EventListenerWrapper<Sender, Args>[] = [];

  constructor() {
  }

  /**
   * {@inheritDoc}
   */
  subscribe(listener: EventListener<Sender, Args>) {
    this.listeners.push(new EventListenerWrapper(listener));
  }

  /**
   * {@inheritDoc}
   */
  subscribeOnce(listener: EventListener<Sender, Args>) {
    this.listeners.push(new EventListenerWrapper(listener, true));
  }

  /**
   * {@inheritDoc}
   */
  subscribeRateLimited(listener: EventListener<Sender, Args>, rateMs: number) {
    this.listeners.push(new RateLimitedEventListenerWrapper(listener, rateMs));
  }

  /**
   * {@inheritDoc}
   */
  unsubscribe(listener: EventListener<Sender, Args>): boolean {
    // Iterate through listeners, compare with parameter, and remove if found
    // NOTE: In case we ever remove all matching listeners instead of just the first, we need to reverse-iterate here
    for (let i = 0; i < this.listeners.length; i++) {
      let subscribedListener = this.listeners[i];
      if (subscribedListener.listener === listener) {
        ArrayUtils.remove(this.listeners, subscribedListener);
        return true;
      }
    }

    return false;
  }

  /**
   * Removes all listeners from this dispatcher.
   */
  unsubscribeAll(): void {
    this.listeners = [];
  }

  /**
   * Dispatches an event to all subscribed listeners.
   * @param sender the source of the event
   * @param args the arguments for the event
   */
  dispatch(sender: Sender, args: Args = null) {
    let listenersToRemove = [];

    // Call every listener
    // We iterate over a copy of the array of listeners to avoid the case where events are not fired on listeners when
    // listeners are unsubscribed from within the event handlers during a dispatch (because the indices change and
    // listeners are shifted within the array).
    // This means that listener x+1 will still be called if unsubscribed from within the handler of listener x, as well
    // as listener y+1 will not be called when subscribed from within the handler of listener y.
    // Array.slice(0) is the fastest array copy method according to: https://stackoverflow.com/a/21514254/370252
    const listeners = this.listeners.slice(0);
    for (let listener of listeners) {
      listener.fire(sender, args);

      if (listener.isOnce()) {
        listenersToRemove.push(listener);
      }
    }

    // Remove one-time listener
    for (let listenerToRemove of listenersToRemove) {
      ArrayUtils.remove(this.listeners, listenerToRemove);
    }
  }

  /**
   * Returns the event that this dispatcher manages and on which listeners can subscribe and unsubscribe event handlers.
   * @returns {Event}
   */
  getEvent(): Event<Sender, Args> {
    // For now, just cast the event dispatcher to the event interface. At some point in the future when the
    // codebase grows, it might make sense to split the dispatcher into separate dispatcher and event classes.
    return <Event<Sender, Args>>this;
  }
}

/**
 * A basic event listener wrapper to manage listeners within the {@link EventDispatcher}. This is a 'private' class
 * for internal dispatcher use and it is therefore not exported.
 */
class EventListenerWrapper<Sender, Args> {

  private eventListener: EventListener<Sender, Args>;
  private once: boolean;

  constructor(listener: EventListener<Sender, Args>, once: boolean = false) {
    this.eventListener = listener;
    this.once = once;
  }

  /**
   * Returns the wrapped event listener.
   * @returns {EventListener<Sender, Args>}
   */
  get listener(): EventListener<Sender, Args> {
    return this.eventListener;
  }

  /**
   * Fires the wrapped event listener with the given arguments.
   * @param sender
   * @param args
   */
  fire(sender: Sender, args: Args) {
    this.eventListener(sender, args);
  }

  /**
   * Checks if this listener is scheduled to be called only once.
   * @returns {boolean} once if true
   */
  isOnce(): boolean {
    return this.once;
  }
}

/**
 * Extends the basic {@link EventListenerWrapper} with rate-limiting functionality.
 */
class RateLimitedEventListenerWrapper<Sender, Args> extends EventListenerWrapper<Sender, Args> {

  private rateMs: number;
  private rateLimitingEventListener: EventListener<Sender, Args>;

  private lastFireTime: number;

  constructor(listener: EventListener<Sender, Args>, rateMs: number) {
    super(listener); // sets the event listener sink

    this.rateMs = rateMs;
    this.lastFireTime = 0;

    // Wrap the event listener with an event listener that does the rate-limiting
    this.rateLimitingEventListener = (sender: Sender, args: Args) => {
      if (Date.now() - this.lastFireTime > this.rateMs) {
        // Only if enough time since the previous call has passed, call the
        // actual event listener and record the current time
        this.fireSuper(sender, args);
        this.lastFireTime = Date.now();
      }
    };
  }

  private fireSuper(sender: Sender, args: Args) {
    // Fire the actual external event listener
    super.fire(sender, args);
  }

  fire(sender: Sender, args: Args) {
    // Fire the internal rate-limiting listener instead of the external event listener
    this.rateLimitingEventListener(sender, args);
  }
}
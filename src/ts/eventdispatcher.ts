/**
 * Function interface for event listeners on the {@link EventDispatcher}.
 */
export interface EventListener<Sender, Args> {
    (sender: Sender, args: Args) : void
}

/**
 * Empty type for creating {@link EventDispatcher event dispatchers} that do not carry any arguments.
 */
export interface NoArgs {
}

export interface Event<Sender, Args> {
    subscribe(listener: EventListener<Sender, Args>): void;
    unsubscribe(listener: EventListener<Sender, Args>): boolean;
}

/**
 * Event dispatcher to subscribe and trigger events. Each event should have it's own dispatcher.
 */
export class EventDispatcher<Sender, Args> implements Event<Sender, Args> {

    private _listeners: EventListener<Sender, Args>[] = [];

    constructor() {
    }

    /**
     * Subscribes an event listener to this event dispatcher.
     * @param listener the listener to add
     */
    subscribe(listener: EventListener<Sender, Args>) {
        this._listeners.push(listener);
    }

    /**
     * Unsubscribes a subscribed event listener from this dispatcher.
     * @param listener the listener to remove
     * @returns {boolean} true if the listener was successfully unsubscribed, false if it isn't subscribed on this dispatcher
     */
    unsubscribe(listener: EventListener<Sender, Args>): boolean {
        // Iterate through listeners, compare with parameter, and remove if found
        for (let i = 0; i < this._listeners.length; i++) {
            let subscribedListener = this._listeners[i];
            if (subscribedListener == listener) {
                this._listeners.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Dispatches an event to all subscribed listeners.
     * @param sender the source of the event
     * @param args the arguments for the event
     */
    dispatch(sender: Sender, args: Args = null) {
        // Call every listener
        for (let listener of this._listeners) {
            listener(sender, args);
        }
    }
}
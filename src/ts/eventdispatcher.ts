/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

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
    subscribeRateLimited(listener: EventListener<Sender, Args>, rateMs: number): void;
    unsubscribe(listener: EventListener<Sender, Args>): boolean;
}

/**
 * Event dispatcher to subscribe and trigger events. Each event should have it's own dispatcher.
 */
export class EventDispatcher<Sender, Args> implements Event<Sender, Args> {

    private listeners: EventListenerWrapper<Sender, Args>[] = [];

    constructor() {
    }

    /**
     * Subscribes an event listener to this event dispatcher.
     * @param listener the listener to add
     */
    subscribe(listener: EventListener<Sender, Args>) {
        this.listeners.push(new EventListenerWrapper(listener));
    }

    subscribeRateLimited(listener: EventListener<Sender, Args>, rateMs: number) {
        this.listeners.push(new RateLimitedEventListenerWrapper(listener, rateMs));
    }

    /**
     * Unsubscribes a subscribed event listener from this dispatcher.
     * @param listener the listener to remove
     * @returns {boolean} true if the listener was successfully unsubscribed, false if it isn't subscribed on this dispatcher
     */
    unsubscribe(listener: EventListener<Sender, Args>): boolean {
        // Iterate through listeners, compare with parameter, and remove if found
        for (let i = 0; i < this.listeners.length; i++) {
            let subscribedListener = this.listeners[i];
            if (subscribedListener.listener == listener) {
                this.listeners.splice(i, 1);
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
        for (let listener of this.listeners) {
            listener.fire(sender, args);
        }
    }
}

class EventListenerWrapper<Sender, Args> {

    private eventListener: EventListener<Sender, Args>;

    constructor(listener: EventListener<Sender, Args>) {
        this.eventListener = listener;
    }

    get listener(): EventListener<Sender, Args> {
        return this.eventListener;
    }

    fire(sender: Sender, args: Args) {
        this.eventListener(sender, args);
    }
}

class RateLimitedEventListenerWrapper<Sender, Args> extends EventListenerWrapper<Sender, Args> {

    private rateMs: number;
    private rateLimitingEventListener: EventListener<Sender, Args>;

    private lastFireTime: number;

    constructor(listener: EventListener<Sender, Args>, rateMs: number) {
        super(listener); // sets the event listener sink

        this.rateMs = rateMs;
        this.lastFireTime = 0;

        let self = this;
        this.rateLimitingEventListener = function(sender: Sender, args: Args) {
            if(Date.now() - this.lastFireTime > this.rateMs) {
                this.fireSuper(sender, args);
                this.lastFireTime = Date.now();
            }
        };
    }

    private fireSuper(sender: Sender, args: Args) {
        super.fire(sender, args);
    }

    fire(sender: Sender, args: Args) {
        this.rateLimitingEventListener(sender, args);
    }
}
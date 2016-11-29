/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Guid} from "../guid";
import {DOM} from "../dom";
import {EventDispatcher, NoArgs, Event} from "../eventdispatcher";
import {UIManager} from "../uimanager";

/**
 * Base configuration interface with common options for all kinds of components.
 */
export interface ComponentConfig {
    /**
     * The HTML tag name of the component, 'div' by default.
     */
    tag?: string;
    /**
     * The HTML ID of the component.
     */
    id?: string;

    /**
     * The CSS classes of the component.
     */
    cssClass?: string; // "class" is a reserved keyword, so we need to make the name more complicated

    /**
     * Additional CSS classes of the component.
     */
    cssClasses?: string[];

    /**
     * Specifies if the component should be hidden at startup.
     * Default: false
     */
    hidden?: boolean;
}

export class Component<Config extends ComponentConfig> {

    private static readonly CLASS_HIDDEN = "hidden";

    /**
     * Configuration object of this component.
     */
    protected config: Config;

    /**
     * JQuery reference to the component's DOM element.
     */
    private element: DOM;

    /**
     * Flag that keeps track of the hidden state.
     */
    private hidden: boolean;

    /**
     * The list of events that this component offers. These events should always be private and only directly
     * accessed from within the implementing component.
     *
     * Because TypeScript does not support private properties with the same name on different class hierarchy levels
     * (i.e. superclass and subclass cannot contain a private property with the same name), the default naming
     * convention for the event list of a component that should be followed by subclasses is the concatenation of the
     * camel-cased class name + "Events" (e.g. SubClass extends Component => subClassEvents).
     * See {@link #componentEvents} for an example.
     *
     * Event properties should be named in camel case with an "on" prefix and in the present tense. Async events may
     * have a start event (when the operation starts) in the present tense, and must have an end event (when the
     * operation ends) in the past tense (or present tense in special cases (e.g. onStart/onStarted or onPlay/onPlaying).
     * See {@link #componentEvents#onShow} for an example.
     *
     * Each event should be accompanied with a protected method named by the convention eventName + "Event"
     * (e.g. onStartEvent), that actually triggers the event by calling {@link EventDispatcher#dispatch dispatch} and
     * passing a reference to the component as first parameter. Components should always trigger their events with these
     * methods. Implementing this pattern gives subclasses means to directly listen to the events by overriding the
     * method (and saving the overhead of passing a handler to the event dispatcher) and more importantly to trigger
     * these events without having access to the private event list.
     * See {@link #onShow} for an example.
     *
     * To provide external code the possibility to listen to this component's events (subscribe, unsubscribe, etc.),
     * each event should also be accompanied by a public getter function with the same name as the event's property,
     * that returns the {@link Event} obtained from the event dispatcher by calling {@link EventDispatcher#getEvent}.
     * See {@link #onShow} for an example.
     *
     * Full example for an event representing an example action in a example component:
     *
     * <code>
     * // Define an example component class with an example event
     * class ExampleComponent extends Component<ComponentConfig> {
     *
     *     private exampleComponentEvents = {
     *         onExampleAction: new EventDispatcher<ExampleComponent, NoArgs>()
     *     }
     *
     *     // constructor and other stuff...
     *
     *     protected onExampleActionEvent() {
     *        this.exampleComponentEvents.onExampleAction.dispatch(this);
     *    }
     *
     *    get onExampleAction(): Event<ExampleComponent, NoArgs> {
     *        return this.exampleComponentEvents.onExampleAction.getEvent();
     *    }
     * }
     *
     * // Create an instance of the component somewhere
     * var exampleComponentInstance = new ExampleComponent();
     *
     * // Subscribe to the example event on the component
     * exampleComponentInstance.onExampleAction.subscribe(function (sender: ExampleComponent) {
     *     console.log("onExampleAction of " + sender + " has fired!");
     * });
     * </code>
     */
    private componentEvents = {
        onShow: new EventDispatcher<Component<Config>, NoArgs>(),
        onHide: new EventDispatcher<Component<Config>, NoArgs>()
    };

    constructor(config: ComponentConfig = {}) {
        console.log(this);
        console.log(config);

        this.config = <Config>this.mergeConfig(config, {
            tag: 'div',
            id: 'ui-id-' + Guid.next(),
            cssClass: 'ui-component',
            cssClasses: [],
            hidden: false
        }, {});
    }

    /**
     * Initializes the component, e.g. by applying config settings. This method must not be called directly by users.
     *
     * This method is automatically called by the {@link UIManager}. If the component is an inner component of
     * some component, and thus managed internally and never directly exposed to the UIManager, this method must
     * be called from the managing component's {@link #initialize} method.
     */
    initialize(): void {
        this.hidden = this.config.hidden;

        if (this.isHidden()) {
            this.hide();
        }
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        // nothing to do here; overwrite in subclasses
    }

    /**
     * Generate DOM element for this component. This element can then be added to the HTML document.
     */
    protected toDomElement(): DOM {
        var element = new DOM(this.config.tag, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        return element;
    }

    getDomElement(): DOM {
        if (!this.element) {
            this.element = this.toDomElement();
        }

        return this.element;
    }

    protected refreshDomElement(): DOM {
        this.element = null;
        return this.getDomElement();
    }

    /**
     * Merges config values into a default config and returns the merged config.
     * The merged config is default config instance extended with the config values, so take care that the supplied
     * defaults config will be changed by this method and returned for the convenience of chaining.
     *
     * @param config
     * @param defaults
     * @returns {ComponentConfig}
     */
    protected mergeConfig<Config>(config: Config, defaults: Config, base: Config): Config {
        // Extend default config with supplied config
        let merged = Object.assign({}, base, defaults, config);

        // Return the extended config
        return merged;
    }

    /**
     * Returns a string of all CSS classes of the component.
     * @returns {string}
     */
    protected getCssClasses(): string {
        // Merge all CSS classes into single array
        let flattenedArray = [this.config.cssClass].concat(this.config.cssClasses);
        // Join array values into a string
        let flattenedString = flattenedArray.join(' ');
        // Return trimmed string to prevent whitespace at the end from the join operation
        return flattenedString.trim();
    }

    public getConfig(): Config {
        return this.config;
    }

    hide() {
        this.hidden = true;
        this.getDomElement().addClass(Component.CLASS_HIDDEN);
        this.onHideEvent();
    }

    show() {
        this.getDomElement().removeClass(Component.CLASS_HIDDEN);
        this.hidden = false;
        this.onShowEvent();
    }

    isHidden(): boolean {
        return this.hidden;
    }

    isShown(): boolean {
        return !this.isHidden();
    }

    toggleHidden() {
        if (this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }

    protected onShowEvent() {
        this.componentEvents.onShow.dispatch(this);
    }

    protected onHideEvent() {
        this.componentEvents.onHide.dispatch(this);
    }

    get onShow(): Event<Component<Config>, NoArgs> {
        return this.componentEvents.onShow.getEvent();
    }

    get onHide(): Event<Component<Config>, NoArgs> {
        return this.componentEvents.onHide.getEvent();
    }
}
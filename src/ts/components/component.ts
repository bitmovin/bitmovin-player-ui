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
    private element: JQuery;

    /**
     * Flag that keeps track of the hidden state.
     */
    private hidden: boolean;

    protected componentEvents = {
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

    /**
     * Generate DOM element for this component. This element can then be added to the HTML document.
     */
    protected toDomElement(): JQuery {
        var element = DOM.JQuery(`<${this.config.tag}>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        return element;
    }

    getDomElement(): JQuery {
        if(!this.element) {
            this.element = this.toDomElement();
        }

        return this.element;
    }

    protected refreshDomElement(): JQuery {
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
        let merged = DOM.JQuery().extend({}, base, defaults, config);

        // Return the extended config
        return merged;
    }

    /**
     * Returns a string of all CSS classes of the component.
     * @returns {string}
     */
    protected getCssClasses() : string {
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
        if(this.isHidden()) {
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
        return this.componentEvents.onShow;
    }

    get onHide(): Event<Component<Config>, NoArgs> {
        return this.componentEvents.onHide;
    }
}
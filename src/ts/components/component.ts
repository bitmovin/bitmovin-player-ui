import {Guid} from "../guid";
import {DOM} from "../dom";

/**
 * Base configuration interface with common options for all kinds of components.
 */
export interface ComponentConfig {
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
     * Specifies if the control bar should be hidden at startup.
     * Default: true
     */
    hidden?: boolean;
}

export abstract class Component<Config extends ComponentConfig> {

    private static readonly CLASS_HIDDEN = "hidden";

    /**
     * Configuration object of this component.
     */
    protected config: Config;

    /**
     * JQuery reference to the component's DOM element.
     */
    private _element: JQuery;

    /**
     * Flag that keeps track of the hidden state.
     */
    private _hidden: boolean;

    constructor(config: Config) {
        console.log(this);
        console.log(config);

        if(!config.id) {
            config.id = 'id-' + Guid.next();
        }

        this._hidden = config.hidden;

        if(this._hidden) {
            this.hide();
        }
    }

    /**
     * Generate DOM element for this component. This element can then be added to the HTML document.
     */
    protected abstract toDomElement(): JQuery;

    getDomElement(): JQuery {
        if(!this._element) {
            this._element = this.toDomElement();
        }

        return this._element;
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
    protected mergeConfig<T extends Config>(config: T, defaults: T): T {
        // Extend default config with supplied config
        DOM.JQuery().extend(defaults, config);

        // Return the extended config
        return defaults;
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
        this._hidden = true;
        this.getDomElement().addClass(Component.CLASS_HIDDEN);
    }

    show() {
        this.getDomElement().removeClass(Component.CLASS_HIDDEN);
        this._hidden = false;
    }

    isHidden(): boolean {
        return this._hidden;
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
}
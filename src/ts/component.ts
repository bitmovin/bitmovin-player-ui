import {Guid} from "./guid";
import {DOM} from "./dom";

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
}

export abstract class Component {

    /**
     * JQuery reference to the component's DOM element.
     */
    private element: JQuery;

    constructor(config: ComponentConfig) {
        console.log(this);
        console.log(config);

        if(!config.id) {
            config.id = 'id-' + Guid.next();
        }
    }

    /**
     * Generate DOM element for this component. This element can then be added to the HTML document.
     */
    abstract toDomElement(): JQuery;

    /**
     * Merges config values into a default config and returns the merged config.
     * The merged config is default config instance extended with the config values, so take care that the supplied
     * defaults config will be changed by this method and returned for the convenience of chaining.
     *
     * @param config
     * @param defaults
     * @returns {ComponentConfig}
     */
    protected mergeConfig<T extends ComponentConfig>(config: T, defaults: T): T {
        // Extend default config with supplied config
        DOM.JQuery().extend(defaults, config);

        // Return the extended config
        return defaults;
    }

}
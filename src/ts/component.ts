import {Guid} from "./guid";

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

    constructor(config: ComponentConfig) {
        console.log(this);
        console.log(config);

        if(!config.id) {
            config.id = 'id-' + Guid.next();
        }

        if(!config.cssClass) {
            config.cssClass = '';
        }
    }

    /**
     * Generate HTML markup for this component.
     */
    abstract toHtml(): string;

}
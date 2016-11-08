export module DOM {

    var jq: JQueryStatic = null;

    /**
     * Returns a JQuery instance for DOM interaction.
     *
     * This function also serves as a central place to track JQuery use, e.g. to make migration to another DOM library
     * easier.
     */
    export function JQuery(...args: any[]): any {
        return this.jq.apply(this, arguments);
    }

    export function setJQuery(jquery: JQueryStatic) {
        this.jq = jquery;
    }
}

import jquery = require("jquery");
DOM.setJQuery(jquery);

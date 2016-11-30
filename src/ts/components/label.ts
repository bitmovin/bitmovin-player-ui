/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";

/**
 * Configuration interface for a {@link Label} component.
 */
export interface LabelConfig extends ComponentConfig {
    /**
     * The text on the label.
     */
    text?: string;
}

/**
 * A simple text label.
 *
 * DOM example:
 * <code>
 *     <span class="ui-label">...some text...</span>
 * </code>
 */
export class Label<Config extends LabelConfig> extends Component<LabelConfig> {

    constructor(config: LabelConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: "ui-label"
        }, this.config);
    }

    protected toDomElement(): DOM {
        let labelElement = new DOM("span", {
            "id": this.config.id,
            "class": this.getCssClasses()
        }).html(this.config.text);

        return labelElement;
    }

    /**
     * Set the text on this label.
     * @param text
     */
    setText(text: string) {
        this.getDomElement().html(text);
    }

    /**
     * Clears the text on this label.
     */
    clearText() {
        this.getDomElement().html("");
    }
}
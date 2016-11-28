/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ComponentConfig, Component} from "./component";
import {DOM2} from "../dom";

/**
 * Configuration interface for a label component.
 */
export interface LabelConfig extends ComponentConfig {
    /**
     * The text on the label.
     */
    text?: string;
}

export class Label<Config extends LabelConfig> extends Component<LabelConfig> {

    constructor(config: LabelConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-label'
        }, this.config);
    }

    protected toDomElement(): DOM2 {
        var labelElement = new DOM2('span', {
            'id': this.config.id,
            'class': this.getCssClasses()
        }).html(this.config.text);

        return labelElement;
    }

    setText(text: string) {
        this.getDomElement().html(text);
    }
}
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Button, ButtonConfig} from "./button";

/**
 * Configuration interface for a {@link Watermark}.
 */
export interface WatermarkConfig extends ButtonConfig {
    /**
     * The url to open when the watermark is clicked. Set to null to disable the click handler.
     */
    url?: string;
}

/**
 * A watermark overlay with a clickable logo.
 */
export class Watermark extends Button<WatermarkConfig> {

    constructor(config: WatermarkConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-watermark',
            url: 'http://bitmovin.com'
        }, <WatermarkConfig>this.config);
    }

    initialize(): void {
        super.initialize();

        if (this.getUrl()) {
            let element = this.getDomElement();
            element.data('url', this.getUrl());
            element.on('click', function () {
                window.open(element.data('url'), '_blank');
            });
        }
    }

    /**
     * Gets the URL that should be followed when the watermark is clicked.
     * @returns {string} the watermark URL
     */
    getUrl(): string {
        return (<WatermarkConfig>this.config).url;
    }
}
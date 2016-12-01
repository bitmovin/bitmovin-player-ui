/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ClickOverlay, ClickOverlayConfig} from "./clickoverlay";

/**
 * Configuration interface for a {@link ClickOverlay}.
 */
export interface WatermarkConfig extends ClickOverlayConfig {
    // nothing yet
}

/**
 * A watermark overlay with a clickable logo.
 */
export class Watermark extends ClickOverlay {

    constructor(config: WatermarkConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: "ui-watermark",
            url: "http://bitmovin.com"
        }, <WatermarkConfig>this.config);
    }
}
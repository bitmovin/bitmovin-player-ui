/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";

export class SettingsPanel extends Container<ContainerConfig> {

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel'
        }, this.config);
    }
}
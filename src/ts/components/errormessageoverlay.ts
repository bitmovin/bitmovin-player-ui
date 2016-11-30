/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";
import ErrorEvent = bitmovin.player.ErrorEvent;

/**
 * Overlays the player and displays error messages.
 */
export class ErrorMessageOverlay extends Container<ContainerConfig> {

    private errorLabel: Label<LabelConfig>;

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.errorLabel = new Label<LabelConfig>({cssClass: 'ui-errormessage-label'});

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-errormessage-overlay',
            components: [this.errorLabel],
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        player.addEventHandler(bitmovin.player.EVENT.ON_ERROR, function (event: ErrorEvent) {
            self.errorLabel.setText(event.message);
            self.show();
        });
    }
}
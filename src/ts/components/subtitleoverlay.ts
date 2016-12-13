/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Container, ContainerConfig} from "./container";
import {UIManager} from "../uimanager";
import SubtitleCueEvent = bitmovin.player.SubtitleCueEvent;
import {Label, LabelConfig} from "./label";
import {ComponentConfig, Component} from "./component";
import {ControlBar} from "./controlbar";

/**
 * Overlays the player to display subtitles.
 */
export class SubtitleOverlay extends Container<ContainerConfig> {

    private static readonly CLASS_CONTROLBAR_VISIBLE = "controlbar-visible";

    /**
     * Inner label that renders the subtitle text
     */
    private subtitleLabel: Label<LabelConfig>;

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.subtitleLabel = new Label<LabelConfig>({cssClass: "ui-subtitle-label"});

        this.config = this.mergeConfig(config, {
            cssClass: "ui-subtitle-overlay",
            components: [this.subtitleLabel]
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;

        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_ENTER, function (event: SubtitleCueEvent) {
            self.subtitleLabel.setText(event.text);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_EXIT, function (event: SubtitleCueEvent) {
            self.subtitleLabel.setText("");
        });

        let subtitleClearHandler = function () {
            self.subtitleLabel.setText("");
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, subtitleClearHandler);

        uimanager.onComponentShow.subscribe(function (component: Component<ComponentConfig>) {
            if (component instanceof ControlBar) {
                self.getDomElement().addClass(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE);
            }
        });
        uimanager.onComponentHide.subscribe(function (component: Component<ComponentConfig>) {
            if (component instanceof ControlBar) {
                self.getDomElement().removeClass(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE);
            }
        });
    }
}
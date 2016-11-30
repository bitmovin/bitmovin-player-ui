/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Container, ContainerConfig} from "./container";
import {Label, LabelConfig} from "./label";
import {Component, ComponentConfig} from "./component";
import {UIManager} from "../uimanager";
import {StringUtils} from "../utils";

/**
 * Configuration interface for a {@link SeekBarLabel}.
 */
export interface SeekBarLabelConfig extends ContainerConfig {
    // nothing yet
}

/**
 * A label for a {@link SeekBar} that can display the seek target time and a thumbnail.
 */
export class SeekBarLabel extends Container<SeekBarLabelConfig> {

    private label: Label<LabelConfig>;
    private thumbnail: Component<ComponentConfig>;

    constructor(config: SeekBarLabelConfig = {}) {
        super(config);

        this.label = new Label({cssClasses: ["seekbar-label"]});
        this.thumbnail = new Component({cssClasses: ["seekbar-thumbnail"]});

        this.config = this.mergeConfig(config, {
            cssClass: "ui-seekbar-label",
            components: [this.thumbnail, this.label],
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        uimanager.onSeekPreview.subscribe(function (sender, percentage) {
            if (player.isLive()) {
                let time = player.getMaxTimeShift() - player.getMaxTimeShift() * (percentage / 100);
                self.setTime(time);
            } else {
                let time = player.getDuration() * (percentage / 100);
                self.setTime(time);
                self.setThumbnail(player.getThumb(time));
            }
        });
    }

    /**
     * Sets arbitrary text on the label.
     * @param text the text to show on the label
     */
    setText(text: string) {
        this.label.setText(text);
    }

    /**
     * Sets a time to be displayed on the label.
     * @param seconds the time in seconds to display on the label
     */
    setTime(seconds: number) {
        this.setText(StringUtils.secondsToTime(seconds));
    }

    /**
     * Sets or removes a thumbnail on the label.
     * @param thumbnail the thumbnail to display on the label or null to remove a displayed thumbnail
     */
    setThumbnail(thumbnail: bitmovin.player.Thumbnail = null) {
        let thumbnailElement = this.thumbnail.getDomElement();

        if (thumbnail == null) {
            thumbnailElement.css({
                "background-image": "none",
                "display": "none"
            });
        }
        else {
            thumbnailElement.css({
                "display": "inherit",
                "background-image": `url(${thumbnail.url})`,
                "width": thumbnail.w + "px",
                "height": thumbnail.h + "px",
                "background-position": `-${thumbnail.x}px -${thumbnail.y}px`
            });
        }
    }
}
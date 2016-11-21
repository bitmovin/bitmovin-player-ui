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
declare var require: any;

export interface SeekBarLabelConfig extends ContainerConfig {

}

export class SeekBarLabel extends Container<SeekBarLabelConfig> {

    private numeral = require('numeral');

    private label: Label<LabelConfig>;
    private thumbnail: Component<ComponentConfig>;

    constructor(config: SeekBarLabelConfig = {}) {
        super(config);

        this.label = new Label({cssClasses: ['seekbar-label']});
        this.thumbnail = new Component({cssClasses: ['seekbar-thumbnail']});

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-seekbar-label',
            components: [this.thumbnail, this.label],
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        uimanager.events.onSeekPreview.subscribe(function (sender, percentage) {
            if(player.isLive()) {
                let time = player.getMaxTimeShift() - player.getMaxTimeShift() * (percentage / 100);
                self.setTime(time);
            } else {
                let time = player.getDuration() * (percentage / 100);
                self.setTime(time);
                self.setThumbnail(player.getThumb(time));
            }
        });
    }

    setText(text: string) {
        this.label.setText(text);
    }

    setTime(seconds: number) {
        if(seconds < 0) {
            // Numeral does not handle negative time so we need to take care of that here
            this.setText("-" + this.numeral(-seconds).format('00:00:00'));
        } else {
            this.setText(this.numeral(seconds).format('00:00:00'));
        }
    }

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
                "background-position": `${thumbnail.x}px ${thumbnail.y}px`
            });
        }
    }
}
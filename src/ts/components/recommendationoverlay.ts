/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {Component, ComponentConfig} from "./component";
import {DOM2} from "../dom";
import {UIManager, UIRecommendationConfig} from "../uimanager";
import {StringUtils} from "../utils";

export class RecommendationOverlay extends Container<ContainerConfig> {

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-overlay',
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        if (!uimanager.getConfig() || !uimanager.getConfig().recommendations || uimanager.getConfig().recommendations.length == 0) {
            // There are no recommendation items, so don't need to configure anything
            return;
        }

        for (let item of uimanager.getConfig().recommendations) {
            this.addComponent(new RecommendationItem({itemConfig: item}));
        }
        this.updateComponents(); // create container DOM elements

        // Display recommendations when playback has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function () {
            self.show();
        });
        // Hide recommendations when playback starts, e.g. a restart
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function () {
            self.hide();
        });
    }
}

interface RecommendationItemConfig extends ComponentConfig {
    itemConfig: UIRecommendationConfig;
}

class RecommendationItem extends Component<RecommendationItemConfig> {

    constructor(config: RecommendationItemConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-item',
            itemConfig: null // this must be passed in from outside
        }, this.config);
    }

    protected toDomElement(): DOM2 {
        let config = (<RecommendationItemConfig>this.config).itemConfig; // TODO fix generics and get rid of cast

        let itemElement = new DOM2('a', {
            'id': this.config.id,
            'class': this.getCssClasses(),
            'href': config.url
        });

        let bgElement = new DOM2('div', {
            'class': 'thumbnail'
        }).css({"background-image": `url(${config.thumbnail})`});
        itemElement.append(bgElement);

        let titleElement = new DOM2('span', {
            'class': 'title'
        }).html(config.title);
        itemElement.append(titleElement);

        let timeElement = new DOM2('span', {
            'class': 'duration'
        }).html(StringUtils.secondsToTime(config.duration));
        itemElement.append(timeElement);

        return itemElement;
    }
}
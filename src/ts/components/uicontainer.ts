/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {NoArgs, EventDispatcher, Event} from "../eventdispatcher";
import {UIManager} from "../uimanager";

export interface UIContainerConfig extends ContainerConfig {
    // nothing to add
}

export class UIContainer extends Container<UIContainerConfig> {

    protected wrapperEvents = {
        onMouseEnter: new EventDispatcher<UIContainer, NoArgs>(),
        onMouseMove: new EventDispatcher<UIContainer, NoArgs>(),
        onMouseLeave: new EventDispatcher<UIContainer, NoArgs>()
    };

    constructor(config: UIContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-wrapper'
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        self.onMouseEnter.subscribe(function (sender) {
            uimanager.events.onMouseEnter.dispatch(sender);
        });
        self.onMouseMove.subscribe(function (sender) {
            uimanager.events.onMouseMove.dispatch(sender);
        });
        self.onMouseLeave.subscribe(function (sender) {
            uimanager.events.onMouseLeave.dispatch(sender);
        });
    }

    protected toDomElement(): JQuery {
        let self = this;
        let container = super.toDomElement();

        container.on('mouseenter', function () {
            self.onMouseEnterEvent();
        });
        container.on('mousemove', function () {
            self.onMouseMoveEvent();
        });
        container.on('mouseleave', function () {
            self.onMouseLeaveEvent();
        });

        return container;
    }

    protected onMouseEnterEvent() {
        this.wrapperEvents.onMouseEnter.dispatch(this);
    }

    protected onMouseMoveEvent() {
        this.wrapperEvents.onMouseMove.dispatch(this);
    }

    protected onMouseLeaveEvent() {
        this.wrapperEvents.onMouseLeave.dispatch(this);
    }

    get onMouseEnter(): Event<UIContainer, NoArgs> {
        return this.wrapperEvents.onMouseEnter;
    }

    get onMouseMove(): Event<UIContainer, NoArgs> {
        return this.wrapperEvents.onMouseMove;
    }

    get onMouseLeave(): Event<UIContainer, NoArgs> {
        return this.wrapperEvents.onMouseLeave;
    }
}
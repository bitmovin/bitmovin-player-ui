/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Button, ButtonConfig} from "./button";
import {NoArgs, EventDispatcher, Event} from "../eventdispatcher";
import {DOM} from "../dom";

/**
 * Configuration interface for a toggle button component.
 */
export interface ToggleButtonConfig extends ButtonConfig {
    /**
     * The text on the button.
     */
    text?: string;
}

export class ToggleButton<Config extends ToggleButtonConfig> extends Button<ToggleButtonConfig> {

    private static readonly CLASS_ON = "on";
    private static readonly CLASS_OFF = "off";

    private onState: boolean;

    private toggleButtonEvents = {
        onToggle: new EventDispatcher<ToggleButton<Config>, NoArgs>(),
        onToggleOn: new EventDispatcher<ToggleButton<Config>, NoArgs>(),
        onToggleOff: new EventDispatcher<ToggleButton<Config>, NoArgs>()
    };

    constructor(config: ToggleButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-togglebutton'
        }, this.config);
    }

    protected toDomElement(): DOM {
        var buttonElement = super.toDomElement();

        return buttonElement;
    }

    protected onClickEvent() {
        this.buttonEvents.onClick.dispatch(this);
    }

    on() {
        this.onState = true;
        this.getDomElement().removeClass(ToggleButton.CLASS_OFF);
        this.getDomElement().addClass(ToggleButton.CLASS_ON);

        this.onToggleEvent();
        this.onToggleOnEvent();
    }

    off() {
        this.onState = false;
        this.getDomElement().removeClass(ToggleButton.CLASS_ON);
        this.getDomElement().addClass(ToggleButton.CLASS_OFF);

        this.onToggleEvent();
        this.onToggleOffEvent();
    }

    toggle() {
        if (this.isOn()) {
            this.off();
        } else {
            this.on();
        }
        this.onToggleEvent();
    }

    isOn(): boolean {
        return this.onState;
    }

    isOff(): boolean {
        return !this.isOn();
    }

    protected onToggleEvent() {
        this.toggleButtonEvents.onToggle.dispatch(this);
    }

    protected onToggleOnEvent() {
        this.toggleButtonEvents.onToggleOn.dispatch(this);
    }

    protected onToggleOffEvent() {
        this.toggleButtonEvents.onToggleOff.dispatch(this);
    }

    get onToggle(): Event<ToggleButton<Config>, NoArgs> {
        return this.toggleButtonEvents.onToggle.getEvent();
    }

    get onToggleOn(): Event<ToggleButton<Config>, NoArgs> {
        return this.toggleButtonEvents.onToggleOn.getEvent();
    }

    get onToggleOff(): Event<ToggleButton<Config>, NoArgs> {
        return this.toggleButtonEvents.onToggleOff.getEvent();
    }
}
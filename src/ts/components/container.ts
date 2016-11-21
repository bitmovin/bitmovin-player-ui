/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ComponentConfig, Component} from "./component";
import {DOM} from "../dom";
import {ArrayUtils} from "../utils";

export interface ContainerConfig extends ComponentConfig {
    /**
     * Child components of the container.
     */
    components?: Component<ComponentConfig>[];
}

export class Container<Config extends ContainerConfig> extends Component<ContainerConfig> {

    private innerContainerElement: JQuery;

    constructor(config: ContainerConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-container',
            components: []
        }, this.config);
    }

    /**
     * Adds a child component to the container.
     * @param component
     */
    addComponent(component: Component<ComponentConfig>) {
        this.config.components.push(component);
    }

    /**
     * Removes a child component from the container.
     * @param component
     */
    removeComponent(component: Component<ComponentConfig>) {
        ArrayUtils.remove(this.config.components, component);
    }

    /**
     * Gets an array of all child components in this container.
     * @returns {Component<ComponentConfig>[]}
     */
    getComponents() : Component<ComponentConfig>[] {
        return this.config.components;
    }

    protected updateComponents(): void {
        this.innerContainerElement.empty();

        for (let component of this.config.components) {
            this.innerContainerElement.append(component.getDomElement());
        }
    }

    protected toDomElement(): JQuery {
        var containerElement = DOM.JQuery(`<${this.config.tag}>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });

        var innerContainer = DOM.JQuery(`<${this.config.tag}>`, {
            'class': 'container-wrapper'
        });
        this.innerContainerElement = innerContainer;

        this.updateComponents();

        containerElement.append(innerContainer);

        return containerElement;
    }
}
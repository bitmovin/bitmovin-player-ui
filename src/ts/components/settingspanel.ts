/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {ContainerConfig, Container} from "./container";
import {SelectBox} from "./selectbox";
import {Label, LabelConfig} from "./label";
import {UIManager} from "../uimanager";
import {VideoQualitySelectBox} from "./videoqualityselectbox";
import {AudioQualitySelectBox} from "./audioqualityselectbox";
import {Timeout} from "../timeout";
import {Event, EventDispatcher, NoArgs} from "../eventdispatcher";

/**
 * Configuration interface for a {@link SettingsPanel}.
 */
export interface SettingsPanelConfig extends ContainerConfig {
    /**
     * The delay in milliseconds after which the settings panel will be hidden when there is no user interaction.
     * Set to -1 to disable automatic hiding.
     * Default: 3 seconds (3000)
     */
    hideDelay?: number;
}

/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
export class SettingsPanel extends Container<SettingsPanelConfig> {

    private static readonly CLASS_LAST = "last";

    private settingsPanelEvents = {
        onSettingsStateChanged: new EventDispatcher<SettingsPanel, NoArgs>()
    };

    constructor(config: SettingsPanelConfig) {
        super(config);

        this.config = this.mergeConfig<SettingsPanelConfig>(config, {
            cssClass: "ui-settings-panel",
            hideDelay: 3000
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let config = <SettingsPanelConfig>this.getConfig(); // TODO fix generics type inference

        if (config.hideDelay > -1) {
            let timeout = new Timeout(config.hideDelay, function () {
                self.hide();
            });

            self.onShow.subscribe(function () {
                // Activate timeout when shown
                timeout.start();
            });
            self.getDomElement().on("mousemove", function () {
                // Reset timeout on interaction
                timeout.reset();
            });
            self.onHide.subscribe(function () {
                // Clear timeout when hidden from outside
                timeout.clear();
            });
        }

        // Fire event when the state of a settings-item has changed
        let settingsStateChangedHandler = function () {
            self.onSettingsStateChangedEvent();

            // Attach marker class to last visible item
            let lastShownItem = null;
            for (let component of self.getItems()) {
                component.getDomElement().removeClass(SettingsPanel.CLASS_LAST);
                if(component.isShown()) {
                    lastShownItem = component;
                }
            }
            if(lastShownItem) {
                lastShownItem.getDomElement().addClass(SettingsPanel.CLASS_LAST);
            }
        };
        for (let component of this.getItems()) {
            component.onActiveChanged.subscribe(settingsStateChangedHandler);
        }
    }

    /**
     * Checks if there are active settings within this settings panel. An active setting is a setting that is visible
     * and enabled, which the user can interact with.
     * @returns {boolean} true if there are active settings, false if the panel is functionally empty to a user
     */
    hasActiveSettings(): boolean {
        for (let component of this.getItems()) {
            if (component.isActive()) {
                return true;
            }
        }

        return false;
    }

    private getItems(): SettingsPanelItem[] {
        return <SettingsPanelItem[]>this.config.components;
    }

    protected onSettingsStateChangedEvent() {
        this.settingsPanelEvents.onSettingsStateChanged.dispatch(this);
    }

    /**
     * Gets the event that is fired when one or more {@link SettingsPanelItem items} have changed state.
     * @returns {Event<SettingsPanel, NoArgs>}
     */
    get onSettingsStateChanged(): Event<SettingsPanel, NoArgs> {
        return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
    }
}

/**
 * An item for a {@link SettingsPanel}, containing a {@link Label} and a component that configures a setting.
 * Supported setting components: {@link SelectBox}
 */
export class SettingsPanelItem extends Container<ContainerConfig> {

    private label: Label<LabelConfig>;
    private setting: SelectBox;

    private settingsPanelItemEvents = {
        onActiveChanged: new EventDispatcher<SettingsPanelItem, NoArgs>()
    };

    constructor(label: string, selectBox: SelectBox, config: ContainerConfig = {}) {
        super(config);

        this.label = new Label({text: label});
        this.setting = selectBox;

        this.config = this.mergeConfig(config, {
            cssClass: "ui-settings-panel-entry",
            components: [this.label, this.setting]
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let handleConfigItemChanged = function () {
            // The minimum number of items that must be available for the setting to be displayed
            // By default, at least two items must be available, else a selection is not possible
            let minItemsToDisplay = 2;
            // Audio/video quality select boxes contain an additional "auto" mode, which in combination with a single available quality also does not make sense
            if (self.setting instanceof VideoQualitySelectBox || self.setting instanceof AudioQualitySelectBox) {
                minItemsToDisplay = 3;
            }

            // Hide the setting if no meaningful choice is available
            if (self.setting.itemCount() < minItemsToDisplay) {
                self.hide();
            } else {
                self.show();
            }

            // Visibility might have changed and therefore the active state might have changed so we fire the event
            // TODO fire only when state has really changed (e.g. check if visibility has really changed)
            self.onActiveChangedEvent();
        };

        self.setting.onItemAdded.subscribe(handleConfigItemChanged);
        self.setting.onItemRemoved.subscribe(handleConfigItemChanged);

        // Initialize hidden state
        handleConfigItemChanged();
    }

    /**
     * Checks if this settings panel item is active, i.e. visible and enabled and a user can interact with it.
     * @returns {boolean} true if the panel is active, else false
     */
    isActive(): boolean {
        return this.isShown();
    }

    protected onActiveChangedEvent() {
        this.settingsPanelItemEvents.onActiveChanged.dispatch(this);
    }

    /**
     * Gets the event that is fired when the "active" state of this item changes.
     * @see #isActive
     * @returns {Event<SettingsPanelItem, NoArgs>}
     */
    get onActiveChanged(): Event<SettingsPanelItem, NoArgs> {
        return this.settingsPanelItemEvents.onActiveChanged.getEvent();
    }
}
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Wrapper} from "./components/wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./components/component";
import {Container} from "./components/container";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar} from "./components/seekbar";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {ControlBar} from "./components/controlbar";
import {NoArgs, EventDispatcher} from "./eventdispatcher";
import {SettingsToggleButton} from "./components/settingstogglebutton";
import {SettingsPanel, SettingsPanelItem} from "./components/settingspanel";
import {VideoQualitySelectBox} from "./components/videoqualityselectbox";
import {Watermark} from "./components/watermark";
import {Label} from "./components/label";
import {AudioQualitySelectBox} from "./components/audioqualityselectbox";
import {AudioTrackSelectBox} from "./components/audiotrackselectbox";
import {SeekBarLabel} from "./components/seekbarlabel";
import {VolumeSlider} from "./components/volumeslider";
import {SubtitleSelectBox} from "./components/subtitleselectbox";
import {SubtitleOverlay} from "./components/subtitleoverlay";
import {VolumeControlButton} from "./components/volumecontrolbutton";
import {CastToggleButton} from "./components/casttogglebutton";
import {CastStatusOverlay} from "./components/caststatusoverlay";
import {ErrorMessageOverlay} from "./components/errormessageoverlay";
import {TitleBar} from "./components/titlebar";
import Player = bitmovin.player.Player;
import {RecommendationOverlay} from "./components/recommendationoverlay";

export interface UIRecommendationConfig {
    title: string;
    url: string;
    thumbnail?: string;
    duration?: number;
}

export interface UIConfig {
    metadata?: {
        title?: string
    };
    recommendations?: UIRecommendationConfig[];
}

export class UIManager {

    private player: bitmovin.player.Player;
    private ui: Component<ComponentConfig>;
    private config: UIConfig;

    // TODO make these accessible from outside, might be helpful to to have UI API events too
    public events = {
        /**
         * Fires when the mouse enters the UI area.
         */
        onMouseEnter: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse moves inside the UI area.
         */
        onMouseMove: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse leaves the UI area.
         */
        onMouseLeave: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when a seek starts.
         */
        onSeek: new EventDispatcher<SeekBar, NoArgs>(),
        /**
         * Fires when the seek timeline is scrubbed.
         */
        onSeekPreview: new EventDispatcher<SeekBar, number>(),
        /**
         * Fires when a seek is finished.
         */
        onSeeked: new EventDispatcher<SeekBar, NoArgs>()
    };

    constructor(player: Player, ui: Wrapper, config: UIConfig = {}) {
        this.player = player;
        this.ui = ui;
        this.config = config;

        let playerId = player.getFigure().parentElement.id;

        // Add UI elements to player
        DOM.JQuery(`#${playerId}`).append(ui.getDomElement());

        this.configureControls(ui);
    }

    getConfig(): UIConfig {
        return this.config;
    }

    private configureControls(component: Component<ComponentConfig>) {
        component.initialize();
        component.configure(this.player, this);

        if (component instanceof Container) {
            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }

    static Factory = class {
        static buildDefaultUI(player: Player, config: UIConfig = {}): UIManager {
            let ui = UIManager.Factory.assembleTestUI();
            let manager = new UIManager(player, ui, config);
            return manager;
        }

        private static assembleDefaultUI(): Wrapper {
            var settingsPanel = new SettingsPanel({
                components: [
                    new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
                    new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
                    new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
                    new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
                ],
                hidden: true
            });

            var controlBar = new ControlBar({
                components: [
                    settingsPanel,
                    new PlaybackToggleButton(),
                    new SeekBar({label: new SeekBarLabel()}),
                    new PlaybackTimeLabel(),
                    new VRToggleButton(),
                    new VolumeControlButton(),
                    new SettingsToggleButton({settingsPanel: settingsPanel}),
                    new CastToggleButton(),
                    new FullscreenToggleButton()
                ]
            });

            var ui = new Wrapper({
                components: [
                    new SubtitleOverlay(),
                    new CastStatusOverlay(),
                    new HugePlaybackToggleButton(),
                    new Watermark(),
                    new RecommendationOverlay(),
                    controlBar,
                    new TitleBar(),
                    new ErrorMessageOverlay()
                ], cssClasses: ['ui-skin-default']
            });

            console.log(ui);

            return ui;
        }

        private static assembleTestUI(): Wrapper {
            var settingsPanel = new SettingsPanel({
                components: [
                    new SettingsPanelItem('Video Quality', new VideoQualitySelectBox()),
                    new SettingsPanelItem('Audio Track', new AudioTrackSelectBox()),
                    new SettingsPanelItem('Audio Quality', new AudioQualitySelectBox()),
                    new SettingsPanelItem('Subtitles', new SubtitleSelectBox())
                ],
                hidden: true
            });

            var controlBar = new ControlBar({
                components: [settingsPanel,
                    new PlaybackToggleButton(),
                    new SeekBar({label: new SeekBarLabel()}),
                    new PlaybackTimeLabel(),
                    new VRToggleButton(),
                    new VolumeToggleButton(),
                    new VolumeSlider(),
                    new VolumeControlButton(),
                    new VolumeControlButton({vertical: false}),
                    new SettingsToggleButton({settingsPanel: settingsPanel}),
                    new CastToggleButton(),
                    new FullscreenToggleButton()
                ]
            });

            var ui = new Wrapper({
                components: [
                    new SubtitleOverlay(),
                    new CastStatusOverlay(),
                    new HugePlaybackToggleButton(),
                    new Watermark(),
                    new RecommendationOverlay(),
                    controlBar,
                    new TitleBar(),
                    new ErrorMessageOverlay()
                ], cssClasses: ['ui-skin-default']
            });

            console.log(ui);

            return ui;
        }
    }
}

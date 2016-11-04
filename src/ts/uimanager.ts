import {Wrapper} from "./wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./component";
import {Container, ContainerConfig} from "./container";
import {PlaybackToggleButton} from "./playbacktogglebutton";
import {FullscreenToggleButton} from "./fullscreentogglebutton";

declare var bitmovin: any;

export class UIManager {

    private player: any;
    private ui: Component<ComponentConfig>;

    constructor(player: any, ui: Wrapper) {
        this.player = player;
        this.ui = ui;

        let playerId = player.getFigure().parentElement.id;

        // Add UI elements to player
        DOM.JQuery(`#${playerId}`).append(ui.getDomElement());

        this.configureControls(ui);
    }

    private configureControls(component: Component<ComponentConfig>) {
        if (component instanceof PlaybackToggleButton) {
            let playbackToggleButton = <PlaybackToggleButton> component;
            let p = this.player;

            let playbackStateHandler = function() {
                if (p.isPlaying()) {
                    playbackToggleButton.play();
                } else {
                    playbackToggleButton.pause();
                }
            };

            p.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
            p.addEventHandler(bitmovin.player.EVENT.ON_PAUSE, playbackStateHandler);

            playbackToggleButton.getDomElement().on('click', function () {
                if (p.isPlaying()) {
                    p.pause();
                } else {
                    p.play();
                }
            })
        }
        else if (component instanceof FullscreenToggleButton) {
            let fullscreenToggleButton = <FullscreenToggleButton> component;
            let p = this.player;

            let fullscreenStateHandler = function() {
                if (p.isFullscreen()) {
                    fullscreenToggleButton.fullscreen();
                } else {
                    fullscreenToggleButton.window();
                }
            };

            p.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_ENTER, fullscreenStateHandler);
            p.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_EXIT, fullscreenStateHandler);

            fullscreenToggleButton.getDomElement().on('click', function () {
                if (p.isFullscreen()) {
                    p.exitFullscreen();
                } else {
                    p.enterFullscreen();
                }
            })
        }
        else if (component instanceof Container) {
            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }
}
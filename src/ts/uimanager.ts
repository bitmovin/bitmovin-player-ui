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
            this.configurePlaybackToggleButton(component);
        }
        else if (component instanceof FullscreenToggleButton) {
            this.configureFullscreenToggleButton(component);
        }
        else if (component instanceof Container) {
            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }

    private configurePlaybackToggleButton(playbackToggleButton: PlaybackToggleButton) {
        // Get a local reference to the player for use inside event handlers in a different scope
        let p = this.player;

        // Handler to update button state based on player state
        let playbackStateHandler = function () {
            if (p.isPlaying()) {
                playbackToggleButton.play();
            } else {
                playbackToggleButton.pause();
            }
        };

        // Call handler upon these events
        p.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_PAUSE, playbackStateHandler);

        // Control player by button events
        // When a button event triggers a player API call, events are fired which in turn call the event handler
        // above that updated the button state.
        playbackToggleButton.getDomElement().on('click', function () {
            if (p.isPlaying()) {
                p.pause();
            } else {
                p.play();
            }
        });
    }

    private configureFullscreenToggleButton(fullscreenToggleButton: FullscreenToggleButton) {
        let p = this.player;

        let fullscreenStateHandler = function () {
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
        });
    }
}
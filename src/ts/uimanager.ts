import {Wrapper} from "./wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./component";
import {Container, ContainerConfig} from "./container";
import {PlaybackToggleButton} from "./playbacktogglebutton";

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

            playbackToggleButton.getDomElement().on('click', function () {
                if (p.isPlaying()) {
                    playbackToggleButton.pause();
                    p.pause();
                } else {
                    playbackToggleButton.play();
                    p.play();
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
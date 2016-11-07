import {Button, ButtonConfig} from "./button";

export class PlaybackToggleButton extends Button {

    private static readonly CLASS_PLAYING = "playing";
    private static readonly CLASS_PAUSED = "paused";

    private playing: boolean;

    constructor(config: ButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-playbacktogglebutton'
        });
    }

    protected toDomElement(): JQuery {
        var buttonElement = super.toDomElement();

        return buttonElement;
    }

    play() {
        this.playing = true;
        this.getDomElement().removeClass(PlaybackToggleButton.CLASS_PAUSED);
        this.getDomElement().addClass(PlaybackToggleButton.CLASS_PLAYING);
    }

    pause() {
        this.playing = false;
        this.getDomElement().removeClass(PlaybackToggleButton.CLASS_PLAYING);
        this.getDomElement().addClass(PlaybackToggleButton.CLASS_PAUSED);
    }

    toggle() {
        if(this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    isPlaying(): boolean {
        return this.playing;
    }

    isPaused(): boolean {
        return !this.isPlaying();
    }

}
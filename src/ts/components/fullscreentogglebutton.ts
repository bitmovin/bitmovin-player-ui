import {Button, ButtonConfig} from "./button";

export class FullscreenToggleButton extends Button {

    private static readonly CLASS_FULLSCREEN = "fullscreen";
    private static readonly CLASS_WINDOW = "window";

    private fullscreenState: boolean;

    constructor(config: ButtonConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-fullscreentogglebutton'
        });
    }

    fullscreen() {
        this.fullscreenState = true;
        this.getDomElement().removeClass(FullscreenToggleButton.CLASS_WINDOW);
        this.getDomElement().addClass(FullscreenToggleButton.CLASS_FULLSCREEN);
    }

    window() {
        this.fullscreenState = false;
        this.getDomElement().removeClass(FullscreenToggleButton.CLASS_FULLSCREEN);
        this.getDomElement().addClass(FullscreenToggleButton.CLASS_WINDOW);
    }

    toggle() {
        if(this.isFullscreen()) {
            this.window();
        } else {
            this.fullscreen();
        }
    }

    isFullscreen(): boolean {
        return this.fullscreenState;
    }
}
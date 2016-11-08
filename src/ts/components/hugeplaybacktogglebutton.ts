import {ToggleButtonConfig} from "./togglebutton";
import {PlaybackToggleButton} from "./playbacktogglebutton";
import {DOM} from "../dom";

export class HugePlaybackToggleButton extends PlaybackToggleButton {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-hugeplaybacktogglebutton',
            text: 'Play/Pause'
        });
    }

    protected toDomElement(): JQuery {
        var buttonElement = super.toDomElement();

        // Add child that contains the play button image
        // Setting the image directly on the button does not work together with scaling animations, because the button
        // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
        // to the size if the image, it can scale inside the player without overshooting.
        buttonElement.append(DOM.JQuery(`<div>`, {
            'class': 'image'
        }));

        return buttonElement;
    }
}
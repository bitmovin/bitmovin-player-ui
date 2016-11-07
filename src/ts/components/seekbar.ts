import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";

/**
 * Configuration interface for the SeekBar component.
 */
export interface SeekBarConfig extends ComponentConfig {

}

/**
 * SeekBar component that can be used to seek the stream and
 * that displays the current playback position and buffer fill level.
 */
export class SeekBar extends Component<SeekBarConfig> {

    private _seekBarPlaybackPosition: JQuery;
    private _seekBarBufferPosition: JQuery;

    constructor(config: SeekBarConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-seekbar'
        });
    }

    protected toDomElement(): JQuery {
        var seekBarContainer = DOM.JQuery(`<div>`, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });

        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = DOM.JQuery(`<div>`, {
            'class': 'seekbar-bufferlevel'
        });
        this._seekBarBufferPosition = seekBarBufferLevel;

        // Indicator that show where a seek will go to
        var seekBarSeekPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-seekposition'
        });

        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-playbackposition'
        });
        this._seekBarPlaybackPosition = seekBarPlaybackPosition;

        seekBarContainer.append(seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);

        return seekBarContainer;
    }

    setPlaybackPosition(percent: number) {
        this._seekBarPlaybackPosition.css({'width': percent + '%'});
    }

    setBufferPosition(percent: number) {
        this._seekBarBufferPosition.css({'width': percent + '%'});
    }
}
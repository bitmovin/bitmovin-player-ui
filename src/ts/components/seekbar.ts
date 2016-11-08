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

    private static readonly CLASS_SEEKING = "seeking";

    private _seekBarPlaybackPosition: JQuery;
    private _seekBarBufferPosition: JQuery;
    private _seekBarSeekPosition: JQuery;
    private _seekBarBackdrop: JQuery;

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

        var seekBar = DOM.JQuery(`<div>`, {
            'class': 'seekbar'
        });

        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = DOM.JQuery(`<div>`, {
            'class': 'seekbar-bufferlevel'
        });
        this._seekBarBufferPosition = seekBarBufferLevel;

        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-playbackposition'
        });
        this._seekBarPlaybackPosition = seekBarPlaybackPosition;

        // Indicator that show where a seek will go to
        var seekBarSeekPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-seekposition'
        });
        this._seekBarSeekPosition = seekBarSeekPosition;

        // Indicator that shows the full seekbar
        var seekBarBackdrop = DOM.JQuery(`<div>`, {
            'class': 'seekbar-backdrop'
        });
        this._seekBarBackdrop = seekBarBackdrop;

        seekBar.append(seekBarBackdrop, seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);
        seekBarContainer.append(seekBar);

        return seekBarContainer;
    }

    getSeekBar() : JQuery {
        return this.getDomElement().children('.seekbar');
    }

    setPlaybackPosition(percent: number) {
        this._seekBarPlaybackPosition.css({'width': percent + '%'});
    }

    setBufferPosition(percent: number) {
        this._seekBarBufferPosition.css({'width': percent + '%'});
    }

    setSeekPosition(percent: number) {
        this._seekBarSeekPosition.css({'width': percent + '%'});
    }

    setSeeking(seeking: boolean) {
        if (seeking) {
            this.getDomElement().addClass(SeekBar.CLASS_SEEKING);
        } else {
            this.getDomElement().removeClass(SeekBar.CLASS_SEEKING);
        }
    }

    isSeeking(): boolean {
        return this.getDomElement().hasClass(SeekBar.CLASS_SEEKING);
    }
}
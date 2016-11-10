import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";
import {Event, EventDispatcher} from "../eventdispatcher";

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

    private seekBar: JQuery;
    private seekBarPlaybackPosition: JQuery;
    private seekBarBufferPosition: JQuery;
    private seekBarSeekPosition: JQuery;
    private seekBarBackdrop: JQuery;

    protected seekBarEvents = {
        onSeek: new EventDispatcher<SeekBar, number>()
    };

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
        this.seekBar = seekBar;

        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = DOM.JQuery(`<div>`, {
            'class': 'seekbar-bufferlevel'
        });
        this.seekBarBufferPosition = seekBarBufferLevel;

        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-playbackposition'
        });
        this.seekBarPlaybackPosition = seekBarPlaybackPosition;

        // Indicator that show where a seek will go to
        var seekBarSeekPosition = DOM.JQuery(`<div>`, {
            'class': 'seekbar-seekposition'
        });
        this.seekBarSeekPosition = seekBarSeekPosition;

        // Indicator that shows the full seekbar
        var seekBarBackdrop = DOM.JQuery(`<div>`, {
            'class': 'seekbar-backdrop'
        });
        this.seekBarBackdrop = seekBarBackdrop;

        seekBar.append(seekBarBackdrop, seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);

        let self = this;

        // Seek to target time when seekbar is clicked
        seekBar.on('click', function (e: JQueryEventObject) {
            let targetPercentage = 100 * self.getHorizontalMouseOffset(e);
            self.onSeekEvent(targetPercentage);
        });

        // Display seek target indicator when mouse moves over seekbar
        seekBar.on('mousemove', function (e: JQueryEventObject) {
            let offset = self.getHorizontalMouseOffset(e);
            self.setSeekPosition(100 * offset);
        });

        // Hide seek target indicator when mouse leaves seekbar
        seekBar.on('mouseleave', function (e: JQueryEventObject) {
            self.setSeekPosition(0);
        });

        seekBarContainer.append(seekBar);

        return seekBarContainer;
    }

    private getHorizontalMouseOffset(e: JQueryEventObject): number {
        let elementOffsetPx = this.seekBar.offset().left;
        let widthPx = this.seekBar.width();
        let offsetPx = e.pageX - elementOffsetPx;
        let offset = 1 / widthPx * offsetPx;

        // console.log({
        //     widthPx: widthPx,
        //     offsetPx: offsetPx,
        //     duration: p.getDuration(),
        //     offset: offset,
        // });

        return offset;
    }

    setPlaybackPosition(percent: number) {
        this.seekBarPlaybackPosition.css({'width': percent + '%'});
    }

    setBufferPosition(percent: number) {
        this.seekBarBufferPosition.css({'width': percent + '%'});
    }

    setSeekPosition(percent: number) {
        this.seekBarSeekPosition.css({'width': percent + '%'});
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

    protected onSeekEvent(percentage: number) {
        this.seekBarEvents.onSeek.dispatch(this, percentage);
    }

    get onSeek(): Event<SeekBar, number> {
        return this.seekBarEvents.onSeek;
    }
}
import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";
import {Event, EventDispatcher, NoArgs} from "../eventdispatcher";

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
        /**
         * Fired when a scrubbing seek operation is started.
         */
        onSeek: new EventDispatcher<SeekBar, NoArgs>(),
        /**
         * Fired during a scrubbing seek to indicate that the seek preview (i.e. the video frame) should be updated.
         */
        onSeekPreview: new EventDispatcher<SeekBar, number>(),
        /**
         * Fired when a scrubbing seek has finished or when a direct seek is issued.
         */
        onSeeked: new EventDispatcher<SeekBar, number>()
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

        // While a seek operation is in progress and the users moves the seek position around the seekbar, we issue
        // regular seeks to keep the picture in sync with the playback position (this makes seeking to a desired position
        // much easier).
        let lastSeekTime = 0; // tracks the time of the last seek while seeking
        let seekInterval = 100; // the interval between seek updates

        // Define handler functions so we can attach/remove them later
        let mouseMoveHandler = function (e: JQueryEventObject) {
            let targetPercentage = 100 * self.getHorizontalMouseOffset(e);
            self.setSeekPosition(targetPercentage);
            self.setPlaybackPosition(targetPercentage);

            // When the seek update interval has passed, issue a seek preview and reset the time
            if(Date.now() - lastSeekTime > seekInterval) {
                self.onSeekPreviewEvent(targetPercentage);
                lastSeekTime = Date.now();
            }
        };
        let mouseUpHandler = function (e: JQueryEventObject) {
            e.preventDefault();

            // Remove handlers, seek operation is finished
            DOM.JQuery(document).off('mousemove', mouseMoveHandler);
            DOM.JQuery(document).off('mouseup', mouseUpHandler);

            let targetPercentage = 100 * self.getHorizontalMouseOffset(e);

            // Sanitize seek target
            // Since we track mouse moves over the whole document, the target can be outside the seek range
            if(targetPercentage < 0) {
                targetPercentage = 0;
            } else if(targetPercentage > 100) {
                targetPercentage = 100;
            }

            self.setSeeking(false);

            // Fire seeked event
            self.onSeekedEvent(targetPercentage);
        };

        // A seek always start with a mousedown directly on the seekbar. To track a seek also outside the seekbar
        // (so the user does not need to take care that the mouse always stays on the seekbar), we attach the mousemove
        // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
        // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
        seekBar.on('mousedown', function (e: JQueryEventObject) {
            // Prevent selection of DOM elements
            e.preventDefault();

            self.setSeeking(true);

            // Fire seeked event
            self.onSeekEvent();

            // Add handler to track the seek operation over the whole document
            DOM.JQuery(document).on('mousemove', mouseMoveHandler);
            DOM.JQuery(document).on('mouseup', mouseUpHandler);
        });

        // Display seek target indicator when mouse hovers over seekbar
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

    /**
     * Puts the seekbar into or out of seeking mode by adding/removing a class to the DOM element. This can be used
     * to adjust the styling while seeking.
     * @param seeking set to true if entering seek mode, false if exiting seek mode
     */
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

    protected onSeekEvent() {
        this.seekBarEvents.onSeek.dispatch(this);
    }

    protected onSeekPreviewEvent(percentage: number) {
        this.seekBarEvents.onSeekPreview.dispatch(this, percentage);
    }

    protected onSeekedEvent(percentage: number) {
        this.seekBarEvents.onSeeked.dispatch(this, percentage);
    }

    get onSeek(): Event<SeekBar, NoArgs> {
        return this.seekBarEvents.onSeek;
    }

    get onSeekPreview(): Event<SeekBar, number> {
        return this.seekBarEvents.onSeekPreview;
    }

    get onSeeked(): Event<SeekBar, number> {
        return this.seekBarEvents.onSeeked;
    }
}
import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";
import {Event, EventDispatcher, NoArgs} from "../eventdispatcher";
import {SeekBarLabel} from "./seekbarlabel";
import {UIManager} from "../uimanager";

/**
 * Configuration interface for the SeekBar component.
 */
export interface SeekBarConfig extends ComponentConfig {
    /**
     * The label above the seek position.
     */
    label?: SeekBarLabel;
    /**
     * Bar will be vertical instead of horizontal if set to true.
     */
    vertical?: boolean;
}

export interface SeekPreviewEventArgs extends NoArgs {
    /**
     * Tells if the seek preview event comes from a scrubbing seek.
     */
    scrubbing: boolean;
    /**
     * The timeline position in percent where the event originates.
     */
    position: number;
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

    private label: SeekBarLabel;

    protected seekBarEvents = {
        /**
         * Fired when a scrubbing seek operation is started.
         */
        onSeek: new EventDispatcher<SeekBar, NoArgs>(),
        /**
         * Fired during a scrubbing seek to indicate that the seek preview (i.e. the video frame) should be updated.
         */
        onSeekPreview: new EventDispatcher<SeekBar, SeekPreviewEventArgs>(),
        /**
         * Fired when a scrubbing seek has finished or when a direct seek is issued.
         */
        onSeeked: new EventDispatcher<SeekBar, number>()
    };

    constructor(config: SeekBarConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-seekbar'
        }, this.config);

        this.label = this.config.label;
    }

    initialize(): void {
        super.initialize();

        if(this.hasLabel()) {
            this.getLabel().initialize();
        }
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;
        let playbackNotInitialized = true;
        let isPlaying = false;
        let isSeeking = false;

        // Update playback and buffer positions
        let playbackPositionHandler = function () {
            // Once this handler os called, playback has been started and we set the flag to false
            playbackNotInitialized = false;

            if(player.getDuration() == Infinity) {
                if(console) console.log("LIVE stream, seeking disabled");
            } else {
                if(isSeeking) {
                    // We caught a seek preview seek, do not update the seekbar
                    return;
                }

                let playbackPositionPercentage = 100 / player.getDuration() * player.getCurrentTime();
                self.setPlaybackPosition(playbackPositionPercentage);

                let bufferPercentage = 100 / player.getDuration() * player.getVideoBufferLength();
                self.setBufferPosition(playbackPositionPercentage + bufferPercentage);
            }
        };

        // Update seekbar upon these events
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackPositionHandler); // update playback position when it changes
        player.addEventHandler(bitmovin.player.EVENT.ON_STOP_BUFFERING, playbackPositionHandler); // update bufferlevel when buffering is complete
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler); // update playback position when a seek has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler); // update bufferlevel when a segment has been downloaded
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, playbackPositionHandler); // update playback position of Cast playback

        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, function () {
            self.setSeeking(true);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, function () {
            self.setSeeking(false);
        });

        self.onSeek.subscribe(function(sender) {
            isSeeking = true; // track seeking status so we can catch events from seek preview seeks

            // Notify UI manager of started seek
            uimanager.events.onSeek.dispatch(sender);

            // Save current playback state
            isPlaying = player.isPlaying();

            // Pause playback while seeking
            if(isPlaying) {
                player.pause();
            }
        });
        self.onSeekPreview.subscribe(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Notify UI manager of seek preview
            uimanager.events.onSeekPreview.dispatch(sender, args.position);
        });
        self.onSeekPreview.subscribeRateLimited(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Rate-limited scrubbing seek
            if(args.scrubbing) {
                player.seek(player.getDuration() * (args.position / 100));
            }
        }, 200);
        self.onSeeked.subscribe(function (sender, percentage) {
            isSeeking = false;

            // If playback has not been started before, we need to call play to in it the playback engine for the
            // seek to work. We call pause() immediately afterwards because we actually do not want to play back anything.
            // The flag serves to call play/pause only on the first seek before playback has started, instead of every
            // time a seek is issued.
            if(playbackNotInitialized) {
                playbackNotInitialized = false;
                player.play();
                player.pause();
            }

            // Do the seek
            player.seek(player.getDuration() * (percentage / 100));

            // Continue playback after seek if player was playing when seek started
            if (isPlaying) {
                player.play();
            }

            // Notify UI manager of finished seek
            uimanager.events.onSeeked.dispatch(sender);
        });

        if(self.hasLabel()) {
            // Configure a seekbar label that is internal to the seekbar)
            self.getLabel().configure(player, uimanager);
        }
    }

    protected toDomElement(): JQuery {
        if(this.config.vertical) {
            this.config.cssClasses.push('vertical');
        }

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

        // Define handler functions so we can attach/remove them later
        let mouseMoveHandler = function (e: JQueryEventObject) {
            let targetPercentage = 100 * self.getMouseOffset(e);
            self.setSeekPosition(targetPercentage);
            self.setPlaybackPosition(targetPercentage);
            self.onSeekPreviewEvent(targetPercentage, true);
        };
        let mouseUpHandler = function (e: JQueryEventObject) {
            e.preventDefault();

            // Remove handlers, seek operation is finished
            DOM.JQuery(document).off('mousemove', mouseMoveHandler);
            DOM.JQuery(document).off('mouseup', mouseUpHandler);

            let targetPercentage = 100 * self.getMouseOffset(e);

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
            let position = 100 * self.getMouseOffset(e);
            self.setSeekPosition(position);
            self.onSeekPreviewEvent(position, false);

            if(self.hasLabel() && self.getLabel().isHidden()) {
                self.getLabel().show();
            }
        });

        // Hide seek target indicator when mouse leaves seekbar
        seekBar.on('mouseleave', function (e: JQueryEventObject) {
            self.setSeekPosition(0);

            if(self.hasLabel()) {
                self.getLabel().hide();
            }
        });

        seekBarContainer.append(seekBar);

        if(this.label) {
            seekBarContainer.append(this.label.getDomElement());
        }

        return seekBarContainer;
    }

    private getHorizontalMouseOffset(e: JQueryEventObject): number {
        let elementOffsetPx = this.seekBar.offset().left;
        let widthPx = this.seekBar.width();
        let offsetPx = e.pageX - elementOffsetPx;
        let offset = 1 / widthPx * offsetPx;

        return this.sanitizeOffset(offset);
    }

    private getVerticalMouseOffset(e: JQueryEventObject): number {
        let elementOffsetPx = this.seekBar.offset().top;
        let widthPx = this.seekBar.height();
        let offsetPx = e.pageY - elementOffsetPx;
        let offset = 1 / widthPx * offsetPx;

        return 1 - this.sanitizeOffset(offset);
    }

    private getMouseOffset(e: JQueryEventObject): number {
        if (this.config.vertical) {
            return this.getVerticalMouseOffset(e);
        } else {
            return this.getHorizontalMouseOffset(e);
        }
    }

    private sanitizeOffset(offset: number) {
        // Since we track mouse moves over the whole document, the target can be outside the seek range,
        // and we need to limit it to the [0, 1] range.
        if (offset < 0) {
            offset = 0;
        } else if (offset > 1) {
            offset = 1;
        }

        return offset;
    }

    setPlaybackPosition(percent: number) {
        this.setPosition(this.seekBarPlaybackPosition, percent);
    }

    setBufferPosition(percent: number) {
        this.setPosition(this.seekBarBufferPosition, percent);
    }

    setSeekPosition(percent: number) {
        this.setPosition(this.seekBarSeekPosition, percent);
    }

    private setPosition(element: JQuery, percent: number) {
        let style = this.config.vertical ? {'height': percent + '%'} : {'width': percent + '%'};
        element.css(style);
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

    hasLabel(): boolean {
        return this.label != null;
    }

    getLabel(): SeekBarLabel {
        return this.label;
    }

    protected onSeekEvent() {
        this.seekBarEvents.onSeek.dispatch(this);
    }

    protected onSeekPreviewEvent(percentage: number, scrubbing: boolean) {
        if(this.label) {
            this.label.setText(percentage + "");
            this.label.getDomElement().css({
                "left": percentage + "%"
            });
        }
        this.seekBarEvents.onSeekPreview.dispatch(this, {scrubbing: scrubbing, position: percentage});
    }

    protected onSeekedEvent(percentage: number) {
        this.seekBarEvents.onSeeked.dispatch(this, percentage);
    }

    get onSeek(): Event<SeekBar, NoArgs> {
        return this.seekBarEvents.onSeek;
    }

    get onSeekPreview(): Event<SeekBar, SeekPreviewEventArgs> {
        return this.seekBarEvents.onSeekPreview;
    }

    get onSeeked(): Event<SeekBar, number> {
        return this.seekBarEvents.onSeeked;
    }
}
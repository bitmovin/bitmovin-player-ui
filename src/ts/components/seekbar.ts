/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";
import {Event, EventDispatcher, NoArgs} from "../eventdispatcher";
import {SeekBarLabel} from "./seekbarlabel";
import {UIManager} from "../uimanager";

/**
 * Configuration interface for the {@link SeekBar} component.
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

/**
 * Event argument interface for a seek preview event.
 */
export interface SeekPreviewEventArgs extends NoArgs {
    /**
     * Tells if the seek preview event comes from a scrubbing.
     */
    scrubbing: boolean;
    /**
     * The timeline position in percent where the event originates from.
     */
    position: number;
}

/**
 * A seek bar to seek within the player's media. It displays the purrent playback position, amount of buffed data, seek
 * target, and keeps status about an ongoing seek.
 *
 * The seek bar displays different "bars":
 *  - the playback position, i.e. the position in the media at which the player current playback pointer is positioned
 *  - the buffer position, which usually is the playback position plus the time span that is already buffered ahead
 *  - the seek position, used to preview to where in the timeline a seek will jump to
 */
export class SeekBar extends Component<SeekBarConfig> {

    /**
     * The CSS class that is added to the DOM element while the seek bar is in "seeking" state.
     */
    private static readonly CLASS_SEEKING = "seeking";

    private seekBar: DOM;
    private seekBarPlaybackPosition: DOM;
    private seekBarBufferPosition: DOM;
    private seekBarSeekPosition: DOM;
    private seekBarBackdrop: DOM;

    private label: SeekBarLabel;

    // https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
    private touchSupported = ("ontouchstart" in window);

    private seekBarEvents = {
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
            cssClass: "ui-seekbar"
        }, this.config);

        this.label = this.config.label;
    }

    initialize(): void {
        super.initialize();

        if (this.hasLabel()) {
            this.getLabel().initialize();
        }
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager, configureSeek: boolean = true): void {
        super.configure(player, uimanager);

        if (!configureSeek) {
            // The configureSeek flag can be used by subclasses to disable configuration as seek bar. E.g. the volume
            // slider is reusing this component but adds its own functionality, and does not need the seek functionality.
            // This is actually a hack, the proper solution would be for both seek bar and volume sliders to extend
            // a common base slider component and implement their functionality there.
            return;
        }

        let self = this;
        let playbackNotInitialized = true;
        let isPlaying = false;
        let isSeeking = false;

        // Update playback and buffer positions
        let playbackPositionHandler = function () {
            // Once this handler os called, playback has been started and we set the flag to false
            playbackNotInitialized = false;

            if (isSeeking) {
                // We caught a seek preview seek, do not update the seekbar
                return;
            }

            if (player.isLive()) {
                if (player.getMaxTimeShift() === 0) {
                    // This case must be explicitly handled to avoid division by zero
                    self.setPlaybackPosition(100);
                }
                else {
                    let playbackPositionPercentage = 100 - (100 / player.getMaxTimeShift() * player.getTimeShift());
                    self.setPlaybackPosition(playbackPositionPercentage);
                }

                // Always show full buffer for live streams
                self.setBufferPosition(100);
            }
            else {
                let playbackPositionPercentage = 100 / player.getDuration() * player.getCurrentTime();
                self.setPlaybackPosition(playbackPositionPercentage);

                let bufferPercentage = 100 / player.getDuration() * player.getVideoBufferLength();
                self.setBufferPosition(playbackPositionPercentage + bufferPercentage);
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            // Reset flag when a new source is loaded
            playbackNotInitialized = true;
        });

        // Update seekbar upon these events
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackPositionHandler); // update playback position when it changes
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, playbackPositionHandler); // update bufferlevel when buffering is complete
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler); // update playback position when a seek has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, playbackPositionHandler); // update playback position when a timeshift has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler); // update bufferlevel when a segment has been downloaded
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, playbackPositionHandler); // update playback position of Cast playback

        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, function () {
            self.setSeeking(true);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, function () {
            self.setSeeking(false);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, function () {
            self.setSeeking(true);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, function () {
            self.setSeeking(false);
        });

        let seek = function (percentage: number) {
            if (player.isLive()) {
                player.timeShift(player.getMaxTimeShift() - (player.getMaxTimeShift() * (percentage / 100)));
            } else {
                player.seek(player.getDuration() * (percentage / 100));
            }
        };
        self.onSeek.subscribe(function (sender) {
            isSeeking = true; // track seeking status so we can catch events from seek preview seeks

            // Notify UI manager of started seek
            uimanager.onSeek.dispatch(sender);

            // Save current playback state
            isPlaying = player.isPlaying();

            // Pause playback while seeking
            if (isPlaying) {
                player.pause();
            }
        });
        self.onSeekPreview.subscribe(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Notify UI manager of seek preview
            uimanager.onSeekPreview.dispatch(sender, args.position);
        });
        self.onSeekPreview.subscribeRateLimited(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Rate-limited scrubbing seek
            if (args.scrubbing) {
                seek(args.position);
            }
        }, 200);
        self.onSeeked.subscribe(function (sender, percentage) {
            isSeeking = false;

            // If playback has not been started before, we need to call play to in it the playback engine for the
            // seek to work. We call pause() immediately afterwards because we actually do not want to play back anything.
            // The flag serves to call play/pause only on the first seek before playback has started, instead of every
            // time a seek is issued.
            if (playbackNotInitialized) {
                playbackNotInitialized = false;
                player.play();
                player.pause();
            }

            // Do the seek
            seek(percentage);

            // Continue playback after seek if player was playing when seek started
            if (isPlaying) {
                player.play();
            }

            // Notify UI manager of finished seek
            uimanager.onSeeked.dispatch(sender);
        });

        if (self.hasLabel()) {
            // Configure a seekbar label that is internal to the seekbar)
            self.getLabel().configure(player, uimanager);
        }
    }

    protected toDomElement(): DOM {
        if (this.config.vertical) {
            this.config.cssClasses.push("vertical");
        }

        let seekBarContainer = new DOM("div", {
            "id": this.config.id,
            "class": this.getCssClasses()
        });

        let seekBar = new DOM("div", {
            "class": "seekbar"
        });
        this.seekBar = seekBar;

        // Indicator that shows the buffer fill level
        let seekBarBufferLevel = new DOM("div", {
            "class": "seekbar-bufferlevel"
        });
        this.seekBarBufferPosition = seekBarBufferLevel;

        // Indicator that shows the current playback position
        let seekBarPlaybackPosition = new DOM("div", {
            "class": "seekbar-playbackposition"
        }).append(new DOM("div", {
            "class": "seekbar-playbackposition-marker"
        }));
        this.seekBarPlaybackPosition = seekBarPlaybackPosition;

        // Indicator that show where a seek will go to
        let seekBarSeekPosition = new DOM("div", {
            "class": "seekbar-seekposition"
        });
        this.seekBarSeekPosition = seekBarSeekPosition;

        // Indicator that shows the full seekbar
        let seekBarBackdrop = new DOM("div", {
            "class": "seekbar-backdrop"
        });
        this.seekBarBackdrop = seekBarBackdrop;

        seekBar.append(seekBarBackdrop, seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);

        let self = this;

        // Define handler functions so we can attach/remove them later
        let mouseTouchMoveHandler = function (e: MouseEvent | TouchEvent) {
            e.preventDefault();
            e.stopPropagation();

            let targetPercentage = 100 * self.getOffset(e);
            self.setSeekPosition(targetPercentage);
            self.setPlaybackPosition(targetPercentage);
            self.onSeekPreviewEvent(targetPercentage, true);
        };
        let mouseTouchUpHandler = function (e: MouseEvent | TouchEvent) {
            e.preventDefault();

            // Remove handlers, seek operation is finished
            new DOM(document).off("touchmove mousemove", mouseTouchMoveHandler);
            new DOM(document).off("touchend mouseup", mouseTouchUpHandler);

            let targetPercentage = 100 * self.getOffset(e);

            self.setSeeking(false);

            // Fire seeked event
            self.onSeekedEvent(targetPercentage);
        };

        // A seek always start with a touchstart or mousedown directly on the seekbar.
        // To track a mouse seek also outside the seekbar (for touch events this works automatically),
        // so the user does not need to take care that the mouse always stays on the seekbar, we attach the mousemove
        // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
        // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
        seekBar.on("touchstart mousedown", function (e: MouseEvent | TouchEvent) {
            let isTouchEvent = self.touchSupported && e instanceof TouchEvent;

            // Prevent selection of DOM elements (also prevents mousedown if current event is touchstart)
            e.preventDefault();

            self.setSeeking(true);

            // Fire seeked event
            self.onSeekEvent();

            // Add handler to track the seek operation over the whole document
            new DOM(document).on(isTouchEvent ? "touchmove" : "mousemove", mouseTouchMoveHandler);
            new DOM(document).on(isTouchEvent ? "touchend" : "mouseup", mouseTouchUpHandler);
        });

        // Display seek target indicator when mouse hovers or finger slides over seekbar
        seekBar.on("touchmove mousemove", function (e: MouseEvent | TouchEvent) {
            e.preventDefault();
            e.stopPropagation();

            let position = 100 * self.getOffset(e);
            self.setSeekPosition(position);
            self.setPlaybackPosition(position);
            self.onSeekPreviewEvent(position, false);

            if (self.hasLabel() && self.getLabel().isHidden()) {
                self.getLabel().show();
            }
        });

        // Hide seek target indicator when mouse or finger leaves seekbar
        seekBar.on("touchend mouseleave", function (e: MouseEvent | TouchEvent) {
            e.preventDefault();

            self.setSeekPosition(0);

            if (self.hasLabel()) {
                self.getLabel().hide();
            }
        });

        seekBarContainer.append(seekBar);

        if (this.label) {
            seekBarContainer.append(this.label.getDomElement());
        }

        return seekBarContainer;
    }

    /**
     * Gets the horizontal offset of a mouse/touch event point from the left edge of the seek bar.
     * @param eventPageX the pageX coordinate of an event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the left edge and 1 is the right edge
     */
    private getHorizontalOffset(eventPageX: number): number {
        let elementOffsetPx = this.seekBar.offset().left;
        let widthPx = this.seekBar.width();
        let offsetPx = eventPageX - elementOffsetPx;
        let offset = 1 / widthPx * offsetPx;

        return this.sanitizeOffset(offset);
    }

    /**
     * Gets the vertical offset of a mouse/touch event point from the bottom edge of the seek bar.
     * @param eventPageY the pageX coordinate of an event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the bottom edge and 1 is the top edge
     */
    private getVerticalOffset(eventPageY: number): number {
        let elementOffsetPx = this.seekBar.offset().top;
        let widthPx = this.seekBar.height();
        let offsetPx = eventPageY - elementOffsetPx;
        let offset = 1 / widthPx * offsetPx;

        return 1 - this.sanitizeOffset(offset);
    }

    /**
     * Gets the mouse or touch event offset for the current configuration (horizontal or vertical).
     * @param e the event to calculate the offset from
     * @returns {number} a number in the range of [0, 1]
     * @see #getHorizontalOffset
     * @see #getVerticalOffset
     */
    private getOffset(e: MouseEvent | TouchEvent): number {
        if (this.touchSupported && e instanceof TouchEvent) {
            if (this.config.vertical) {
                return this.getVerticalOffset(e.type === "touchend" ? e.changedTouches[0].pageY : e.touches[0].pageY);
            } else {
                return this.getHorizontalOffset(e.type === "touchend" ? e.changedTouches[0].pageX : e.touches[0].pageX);
            }
        }
        else if (e instanceof MouseEvent) {
            if (this.config.vertical) {
                return this.getVerticalOffset(e.pageY);
            } else {
                return this.getHorizontalOffset(e.pageX);
            }
        }
        else {
            if (console) console.warn("invalid event");
            return 0;
        }
    }

    /**
     * Sanitizes the mouse offset to the range of [0, 1].
     *
     * When tracking the mouse outside the seek bar, the offset can be outside the desired range and this method
     * limits it to the desired range. E.g. a mouse event left of the left edge of a seek bar yields an offset below
     * zero, but to display the seek target on the seek bar, we need to limit it to zero.
     *
     * @param offset the offset to sanitize
     * @returns {number} the sanitized offset.
     */
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

    /**
     * Sets the position of the playback position indicator.
     * @param percent a number between 0 and 100 as returned by the player
     */
    setPlaybackPosition(percent: number) {
        this.setPosition(this.seekBarPlaybackPosition, percent);
    }

    /**
     * Sets the position until which media is buffered.
     * @param percent a number between 0 and 100
     */
    setBufferPosition(percent: number) {
        this.setPosition(this.seekBarBufferPosition, percent);
    }

    /**
     * Sets the position where a seek, if executed, would jump to.
     * @param percent a number between 0 and 100
     */
    setSeekPosition(percent: number) {
        this.setPosition(this.seekBarSeekPosition, percent);
    }

    /**
     * Set the actual position (width or height) of a DOM element that represent a bar in the seek bar.
     * @param element the element to set the position for
     * @param percent a number between 0 and 100
     */
    private setPosition(element: DOM, percent: number) {
        let style = this.config.vertical ? {"height": percent + "%"} : {"width": percent + "%"};
        element.css(style);
    }

    /**
     * Puts the seek bar into or out of seeking state by adding/removing a class to the DOM element. This can be used
     * to adjust the styling while seeking.
     *
     * @param seeking should be true when entering seek state, false when exiting the seek state
     */
    setSeeking(seeking: boolean) {
        if (seeking) {
            this.getDomElement().addClass(SeekBar.CLASS_SEEKING);
        } else {
            this.getDomElement().removeClass(SeekBar.CLASS_SEEKING);
        }
    }

    /**
     * Checks if the seek bar is currently in the seek state.
     * @returns {boolean} true if in seek state, else false
     */
    isSeeking(): boolean {
        return this.getDomElement().hasClass(SeekBar.CLASS_SEEKING);
    }

    /**
     * Checks if the seek bar has a {@link SeekBarLabel}.
     * @returns {boolean} true if the seek bar has a label, else false
     */
    hasLabel(): boolean {
        return this.label != null;
    }

    /**
     * Gets the label of this seek bar.
     * @returns {SeekBarLabel} the label if this seek bar has a label, else null
     */
    getLabel(): SeekBarLabel | null {
        return this.label;
    }

    protected onSeekEvent() {
        this.seekBarEvents.onSeek.dispatch(this);
    }

    protected onSeekPreviewEvent(percentage: number, scrubbing: boolean) {
        if (this.label) {
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

    /**
     * Gets the event that is fired when a scrubbing seek operation is started.
     * @returns {Event<SeekBar, NoArgs>}
     */
    get onSeek(): Event<SeekBar, NoArgs> {
        return this.seekBarEvents.onSeek.getEvent();
    }

    /**
     * Gets the event that is fired during a scrubbing seek (to indicate that the seek preview, i.e. the video frame,
     * should be updated), or during a normal seek preview when the seek bar is hovered (and the seek target,
     * i.e. the seek bar label, should be updated).
     * @returns {Event<SeekBar, SeekPreviewEventArgs>}
     */
    get onSeekPreview(): Event<SeekBar, SeekPreviewEventArgs> {
        return this.seekBarEvents.onSeekPreview.getEvent();
    }

    /**
     * Gets the event that is fired when a scrubbing seek has finished or when a direct seek is issued.
     * @returns {Event<SeekBar, number>}
     */
    get onSeeked(): Event<SeekBar, number> {
        return this.seekBarEvents.onSeeked.getEvent();
    }
}
import {Wrapper} from "./components/wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./components/component";
import {Container, ContainerConfig} from "./components/container";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar} from "./components/seekbar";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {ControlBar, ControlBarConfig} from "./components/controlbar";

declare var bitmovin: any;

export class UIManager {

    private player: any;
    private ui: Component<ComponentConfig>;

    // TODO make these accessible from outside, might be helpful to to have UI API events too
    private events = {
        /**
         * Fires when the mouse enters the UI area.
         */
        onMouseEnter: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse leaves the UI area.
         */
        onMouseLeave: new EventDispatcher<Component<ComponentConfig>, NoArgs>()
    };

    constructor(player: any, ui: Wrapper) {
        this.player = player;
        this.ui = ui;

        let playerId = player.getFigure().parentElement.id;

        // Add UI elements to player
        DOM.JQuery(`#${playerId}`).append(ui.getDomElement());

        this.configureControls(ui);
    }

    private configureControls(component: Component<ComponentConfig>) {
        if (component instanceof HugePlaybackToggleButton) {
            this.configureHugePlaybackToggleButton(component);
        }
        else if (component instanceof PlaybackToggleButton) {
            this.configurePlaybackToggleButton(component, true);
        }
        else if (component instanceof FullscreenToggleButton) {
            this.configureFullscreenToggleButton(component);
        }
        else if (component instanceof VRToggleButton) {
            this.configureVRToggleButton(component);
        }
        else if (component instanceof VolumeToggleButton) {
            this.configureVolumeToggleButton(component);
        }
        else if (component instanceof SeekBar) {
            this.configureSeekBar(component);
        }
        else if (component instanceof PlaybackTimeLabel) {
            this.configurePlaybackTimeLabel(component);
        }
        else if (component instanceof Container) {
            if(component instanceof Wrapper) {
                this.configureWrapper(component);
            }
            else if(component instanceof ControlBar) {
                this.configureControlBar(component);
            }

            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }

    private configurePlaybackToggleButton(playbackToggleButton: PlaybackToggleButton, handleClickEvent: boolean) {
        // Get a local reference to the player for use inside event handlers in a different scope
        let p = this.player;

        // Handler to update button state based on player state
        let playbackStateHandler = function () {
            if (p.isPlaying()) {
                playbackToggleButton.on();
            } else {
                playbackToggleButton.off();
            }
        };

        // Call handler upon these events
        p.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_PAUSE, playbackStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler); // when playback finishes, player turns to paused mode

        if(handleClickEvent) {
            // Control player by button events
            // When a button event triggers a player API call, events are fired which in turn call the event handler
            // above that updated the button state.
            playbackToggleButton.getDomElement().on('click', function () {
                if (p.isPlaying()) {
                    p.pause();
                } else {
                    p.play();
                }
            });
        }
    }

    private configureFullscreenToggleButton(fullscreenToggleButton: FullscreenToggleButton) {
        let p = this.player;

        let fullscreenStateHandler = function () {
            if (p.isFullscreen()) {
                fullscreenToggleButton.on();
            } else {
                fullscreenToggleButton.off();
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_ENTER, fullscreenStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_EXIT, fullscreenStateHandler);

        fullscreenToggleButton.getDomElement().on('click', function () {
            if (p.isFullscreen()) {
                p.exitFullscreen();
            } else {
                p.enterFullscreen();
            }
        });
    }

    private configureVRToggleButton(vrToggleButton: VRToggleButton) {
        let p = this.player;

        let vrStateHandler = function () {
            if (p.getVRStatus().isStereo) {
                vrToggleButton.on();
            } else {
                vrToggleButton.off();
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_VR_MODE_CHANGED, vrStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_VR_STEREO_CHANGED, vrStateHandler);

        vrToggleButton.getDomElement().on('click', function () {
            if(p.getVRStatus().contentType == 'none') {
                if(console) console.log('No VR content');
            } else {
                if (p.getVRStatus().isStereo) {
                    p.setVRStereo(false);
                } else {
                    p.setVRStereo(true);
                }
            }
        });
    }

    private configureVolumeToggleButton(volumeToggleButton: VolumeToggleButton) {
        let p = this.player;

        let muteStateHandler = function () {
            if (p.isMuted()) {
                volumeToggleButton.on();
            } else {
                volumeToggleButton.off();
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_MUTE, muteStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, muteStateHandler);

        volumeToggleButton.getDomElement().on('click', function () {
            if (p.isMuted()) {
                p.unmute();
            } else {
                p.mute();
            }
        });
    }

    private configureSeekBar(seekBar: SeekBar) {
        let p = this.player;

        // Update playback and buffer positions
        let playbackPositionHandler = function () {
            if(p.getDuration() == Infinity) {
                if(console) console.log("LIVE stream, seeking disabled");
            } else {
                let playbackPositionPercentage = 100 / p.getDuration() * p.getCurrentTime();
                seekBar.setPlaybackPosition(playbackPositionPercentage);

                let bufferPercentage = 100 / p.getDuration() * p.getVideoBufferLength();
                seekBar.setBufferPosition(playbackPositionPercentage + bufferPercentage);
            }
        };

        // Update seekbar upon these events
        p.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackPositionHandler); // update playback position when it changes
        p.addEventHandler(bitmovin.player.EVENT.ON_STOP_BUFFERING, playbackPositionHandler); // update bufferlevel when buffering is complete
        p.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler); // update playback position when a seek has finished
        p.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler); // update bufferlevel when a segment has been downloaded

        p.addEventHandler(bitmovin.player.EVENT.ON_SEEK, function () {
            seekBar.setSeeking(true);
        });
        p.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, function () {
            seekBar.setSeeking(false);
        });

        // Get the offset of an event within the seekbar
        let getHorizontalMouseOffset = function (e: JQueryEventObject) {
            let elementOffsetPx = seekBar.getSeekBar().offset().left;
            let widthPx = seekBar.getSeekBar().width();
            let offsetPx = e.pageX - elementOffsetPx;
            let offset = 1 / widthPx * offsetPx;

            // console.log({
            //     widthPx: widthPx,
            //     offsetPx: offsetPx,
            //     duration: p.getDuration(),
            //     offset: offset,
            // });

            return offset;
        };

        // Seek to target time when seekbar is clicked
        seekBar.getSeekBar().on('click', function (e) {
            let targetTime = p.getDuration() * getHorizontalMouseOffset(e);
            p.seek(targetTime);
        });

        // Display seek target indicator when mouse moves over seekbar
        seekBar.getSeekBar().on('mousemove', function (e) {
            let offset = getHorizontalMouseOffset(e);
            seekBar.setSeekPosition(100 * offset);
        });

        // Hide seek target indicator when mouse leaves seekbar
        seekBar.getSeekBar().on('mouseleave', function (e) {
            seekBar.setSeekPosition(0);
        });
    }

    private configurePlaybackTimeLabel(playbackTimeLabel: PlaybackTimeLabel) {
        let p = this.player;

        let playbackTimeHandler = function () {
            if(p.getDuration() == Infinity) {
                playbackTimeLabel.setText('Live');
            } else {
                playbackTimeLabel.setTime(p.getCurrentTime(), p.getDuration());
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);

        // Init time display (when the UI is initialized, it's too late for the ON_READY event)
        playbackTimeHandler();
    }

    private configureHugePlaybackToggleButton(hugePlaybackToggleButton: HugePlaybackToggleButton) {
        // Update button sate trough API events
        this.configurePlaybackToggleButton(hugePlaybackToggleButton, false);

        let p = this.player;

        let togglePlayback = function () {
            if (p.isPlaying()) {
                p.pause();
            } else {
                p.play();
            }
        };

        let toggleFullscreen = function () {
            if (p.isFullscreen()) {
                p.exitFullscreen();
            } else {
                p.enterFullscreen();
            }
        };

        let clickTime = 0;
        let doubleClickTime = 0;

        /*
         * YouTube-style toggle button handling
         *
         * The goal is to prevent a short pause or playback interval between a click, that toggles playback, and a
         * double click, that toggles fullscreen. In this naive approach, the first click would e.g. start playback,
         * the second click would be detected as double click and toggle to fullscreen, and as second normal click stop
         * playback, which results is a short playback interval with max length of the double click detection
         * period (usually 500ms).
         *
         * To solve this issue, we defer handling of the first click for 200ms, which is almost unnoticeable to the user,
         * and just toggle playback if no second click (double click) has been registered during this period. If a double
         * click is registered, we just toggle the fullscreen. In the first 200ms, undesired playback changes thus cannot
         * happen. If a double click is registered within 500ms, we undo the playback change and switch fullscreen mode.
         * In the end, this method basically introduces a 200ms observing interval in which playback changes are prevented
         * if a double click happens.
         */
        hugePlaybackToggleButton.getDomElement().on('click', function () {
            let now = Date.now();

            if (now - clickTime < 200) {
                // We have a double click inside the 200ms interval, just toggle fullscreen mode
                toggleFullscreen();
                doubleClickTime = now;
                return;
            } else if (now - clickTime < 500) {
                // We have a double click inside the 500ms interval, undo playback toggle and toggle fullscreen mode
                toggleFullscreen();
                togglePlayback();
                doubleClickTime = now;
                return;
            }

            clickTime = now;

            setTimeout(function () {
                if (Date.now() - doubleClickTime > 200) {
                    // No double click detected, so we toggle playback and wait what happens next
                    togglePlayback();
                }
            }, 200);
        });
    }

    private configureWrapper(wrapper: Wrapper) {
        let self = this;
        // Fire UI events from DOM events
        wrapper.getDomElement().on('mouseleave', function () {
            self.events.onMouseLeave.dispatch(wrapper, null);
        });
        wrapper.getDomElement().on('mouseenter', function () {
            self.events.onMouseEnter.dispatch(wrapper, null);
        });
    }

    private configureControlBar(controlBar : ControlBar) {
        this.events.onMouseEnter.subscribe(function(sender, args) {
            controlBar.getDomElement().show();
        });
        this.events.onMouseLeave.subscribe(function(sender, args) {
            setTimeout(function () {
                controlBar.getDomElement().hide();
            }, (<ControlBarConfig>controlBar.getConfig()).hideDelay); // TODO fix generics to spare these damn casts... is that even possible in TS?
        });
    }
}

/**
 * Function interface for event listeners on the {@link EventDispatcher}.
 */
interface EventListener<Sender, Args> {
    (sender: Sender, args: Args) : void
}

/**
 * Empty type for creating {@link EventDispatcher event dispatchers} that do not carry any arguments.
 */
interface NoArgs {
}

/**
 * Event dispatcher to subscribe and trigger events. Each event should have it's own dispatcher.
 */
class EventDispatcher<Sender, Args> {

    private _listeners: EventListener<Sender, Args>[] = [];

    constructor() {
    }

    /**
     * Subscribes an event listener to this event dispatcher.
     * @param listener the listener to add
     */
    subscribe(listener: EventListener<Sender, Args>) {
        this._listeners.push(listener);
    }

    /**
     * Unsubscribes a subscribed event listener from this dispatcher.
     * @param listener the listener to remove
     * @returns {boolean} true if the listener was successfully unsubscribed, false if it isn't subscribed on this dispatcher
     */
    unsubscribe(listener: EventListener<Sender, Args>): boolean {
        // Iterate through listeners, compare with parameter, and remove if found
        for (let i = 0; i < this._listeners.length; i++) {
            let subscribedListener = this._listeners[i];
            if (subscribedListener == listener) {
                this._listeners.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Dispatches an event to all subscribed listeners.
     * @param sender the source of the event
     * @param args the arguments for the event
     */
    dispatch(sender: Sender, args: Args) {
        // Call every listener
        for (let listener of this._listeners) {
            listener(sender, args);
        }
    }
}
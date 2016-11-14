import {Wrapper} from "./components/wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./components/component";
import {Container, ContainerConfig} from "./components/container";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar, SeekPreviewEventArgs} from "./components/seekbar";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {ControlBar, ControlBarConfig} from "./components/controlbar";
import {NoArgs, EventDispatcher} from "./eventdispatcher";
import {SettingsToggleButton, SettingsToggleButtonConfig} from "./components/settingstogglebutton";
import {SettingsPanel} from "./components/settingspanel";
import {VideoQualitySelectBox} from "./components/videoqualityselectbox";
import {Watermark} from "./components/watermark";
import {Label} from "./components/label";
import {AudioQualitySelectBox} from "./components/audioqualityselectbox";
import {AudioTrackSelectBox} from "./components/audiotrackselectbox";
import {SeekBarLabel} from "./components/seekbarlabel";
import {VolumeControlBar} from "./components/volumecontrolbar";

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
         * Fires when the mouse moves inside the UI area.
         */
        onMouseMove: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse leaves the UI area.
         */
        onMouseLeave: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when a seek starts.
         */
        onSeek: new EventDispatcher<SeekBar, NoArgs>(),
        /**
         * Fires when the seek timeline is scrubbed.
         */
        onSeekPreview: new EventDispatcher<SeekBar, number>(),
        /**
         * Fires when a seek is finished.
         */
        onSeeked: new EventDispatcher<SeekBar, NoArgs>()
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
        component.initialize();

        if (component instanceof HugePlaybackToggleButton) { // must come before PlaybackButton (because it's a subclass)
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
        else if (component instanceof SettingsToggleButton) {
            this.configureSettingsToggleButton(component);
        }
        else if (component instanceof VolumeControlBar) { // must come before SeekBar (superclass)
            this.configureVolumeControlBar(component);
        }
        else if (component instanceof SeekBar) {
            this.configureSeekBar(component);
        }
        else if (component instanceof SeekBarLabel) {
            this.configureSeekBarLabel(component);
        }
        else if (component instanceof PlaybackTimeLabel) {
            this.configurePlaybackTimeLabel(component);
        }
        else if (component instanceof VideoQualitySelectBox) {
            this.configureVideoQualitySelectBox(component);
        }
        else if (component instanceof AudioQualitySelectBox) {
            this.configureAudioQualitySelectBox(component);
        }
        else if (component instanceof AudioTrackSelectBox) {
            this.configureAudioTrackSelectBox(component);
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
        let isSeeking = false;

        // Handler to update button state based on player state
        let playbackStateHandler = function () {
            // If the UI is currently seeking, playback is temporarily stopped but the buttons should
            // not reflect that and stay as-is (e.g indicate playback while seeking).
            if(isSeeking) {
                return;
            }

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
            playbackToggleButton.onClick.subscribe(function () {
                if (p.isPlaying()) {
                    p.pause();
                } else {
                    p.play();
                }
            });
        }

        // Track UI seeking status
        this.events.onSeek.subscribe(function () {
            isSeeking = true;
        });
        this.events.onSeeked.subscribe(function () {
            isSeeking = false;
        });
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

        fullscreenToggleButton.onClick.subscribe(function () {
            if (p.isFullscreen()) {
                p.exitFullscreen();
            } else {
                p.enterFullscreen();
            }
        });
    }

    private configureVRToggleButton(vrToggleButton: VRToggleButton) {
        let p = this.player;

        let isVRConfigured = function () {
            // VR availability cannot be checked through getVRStatus() because it is asynchronously populated and not
            // available at UI initialization. As an alternative, we check the VR settings in the config.
            // TODO use getVRStatus() through isVRStereoAvailable() once the player has been rewritten and the status is available in ON_READY
            let config = p.getConfig();
            return config.source && config.source.vr && config.source.vr.contentType != 'none';
        };

        let isVRStereoAvailable = function () {
            return p.getVRStatus().contentType != 'none';
        };

        let vrStateHandler = function () {
            if(isVRConfigured() && isVRStereoAvailable()) {
                vrToggleButton.show(); // show button in case it is hidden

                if (p.getVRStatus().isStereo) {
                    vrToggleButton.on();
                } else {
                    vrToggleButton.off();
                }
            } else {
                vrToggleButton.hide(); // hide button if no stereo mode available
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_VR_MODE_CHANGED, vrStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_VR_STEREO_CHANGED, vrStateHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_VR_ERROR, vrStateHandler);

        vrToggleButton.onClick.subscribe(function () {
            if(!isVRStereoAvailable()) {
                if(console) console.log('No VR content');
            } else {
                if (p.getVRStatus().isStereo) {
                    p.setVRStereo(false);
                } else {
                    p.setVRStereo(true);
                }
            }
        });

        // Hide stereo button if no VR video is configured
        if (!isVRConfigured()) {
            vrToggleButton.hide();
        }
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

        volumeToggleButton.onClick.subscribe(function () {
            if (p.isMuted()) {
                p.unmute();
            } else {
                p.mute();
            }
        });
    }

    private configureVolumeControlBar(volumeControlBar: VolumeControlBar) {
        let p = this.player;

        let volumeChangeHandler = function () {
            if(p.isMuted()) {
                volumeControlBar.setPlaybackPosition(0);
                volumeControlBar.setBufferPosition(0);
            } else {
                volumeControlBar.setPlaybackPosition(p.getVolume());
                volumeControlBar.setBufferPosition(p.getVolume());
            }
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGE, volumeChangeHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_MUTE, volumeChangeHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, volumeChangeHandler);

        volumeControlBar.onSeekPreview.subscribe(function (sender, args) {
            if(args.scrubbing) {
                p.setVolume(args.position);
            }
        });

        // Init volume bar
        volumeChangeHandler();
    }

    private configureSeekBar(seekBar: SeekBar) {
        let self = this;
        let p = this.player;
        let playbackNotInitialized = true;
        let isPlaying = false;
        let isSeeking = false;

        // Update playback and buffer positions
        let playbackPositionHandler = function () {
            // Once this handler os called, playback has been started and we set the flag to false
            playbackNotInitialized = false;

            if(p.getDuration() == Infinity) {
                if(console) console.log("LIVE stream, seeking disabled");
            } else {
                if(isSeeking) {
                    // We caught a seek preview seek, do not update the seekbar
                    return;
                }

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

        seekBar.onSeek.subscribe(function(sender) {
            isSeeking = true; // track seeking status so we can catch events from seek preview seeks

            // Notify UI manager of started seek
            self.events.onSeek.dispatch(sender);

            // Save current playback state
            isPlaying = p.isPlaying();

            // Pause playback while seeking
            if(isPlaying) {
                p.pause();
            }
        });
        seekBar.onSeekPreview.subscribe(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Notify UI manager of seek preview
            self.events.onSeekPreview.dispatch(sender, args.position);
        });
        seekBar.onSeekPreview.subscribeRateLimited(function (sender: SeekBar, args: SeekPreviewEventArgs) {
            // Rate-limited scrubbing seek
            if(args.scrubbing) {
                p.seek(p.getDuration() * (args.position / 100));
            }
        }, 200);
        seekBar.onSeeked.subscribe(function (sender, percentage) {
            isSeeking = false;

            // If playback has not been started before, we need to call play to in it the playback engine for the
            // seek to work. We call pause() immediately afterwards because we actually do not want to play back anything.
            // The flag serves to call play/pause only on the first seek before playback has started, instead of every
            // time a seek is issued.
            if(playbackNotInitialized) {
                playbackNotInitialized = false;
                p.play();
                p.pause();
            }

            // Do the seek
            p.seek(p.getDuration() * (percentage / 100));

            // Continue playback after seek if player was playing when seek started
            if (isPlaying) {
                p.play();
            }

            // Notify UI manager of finished seek
            self.events.onSeeked.dispatch(sender);
        });

        if(seekBar.hasLabel()) {
            // Configure a seekbar label that is internal to the seekbar)
            this.configureSeekBarLabel(seekBar.getLabel());
        }
    }

    private configureSeekBarLabel(seekBarLabel: SeekBarLabel) {
        let p = this.player;

        this.events.onSeekPreview.subscribe(function (sender, percentage) {
            let time = p.getDuration() * (percentage / 100);
            seekBarLabel.setTime(time);
            seekBarLabel.setThumbnail(p.getThumb(time));
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
        // Update button state through API events
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
        hugePlaybackToggleButton.onClick.subscribe(function () {
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

        // Hide the huge playback button during VR playback to let mouse events pass through and navigate the VR viewport
        hugePlaybackToggleButton.onToggle.subscribe(function() {
            if(p.getVRStatus().contentType != 'none') {
                if (p.isPlaying()) {
                    hugePlaybackToggleButton.hide();
                } else {
                    hugePlaybackToggleButton.show();
                }
            }
        });
    }

    private configureWrapper(wrapper: Wrapper) {
        let self = this;
        wrapper.onMouseEnter.subscribe(function (sender) {
            self.events.onMouseEnter.dispatch(sender);
        });
        wrapper.onMouseMove.subscribe(function (sender) {
            self.events.onMouseMove.dispatch(sender);
        });
        wrapper.onMouseLeave.subscribe(function (sender) {
            self.events.onMouseLeave.dispatch(sender);
        });
    }

    private configureControlBar(controlBar : ControlBar) {
        let self = this;
        let isSeeking = false;
        let controlBarHideDelayTimeoutHandle = 0;

        // Clears the hide timeout if active
        let clearHideTimeout = function () {
            clearTimeout(controlBarHideDelayTimeoutHandle);
        };

        // Activates the hide timeout and clears a previous timeout if active
        let setHideTimeout = function () {
            clearHideTimeout();
            controlBarHideDelayTimeoutHandle = setTimeout(function () {
                controlBar.hide();
            }, (<ControlBarConfig>controlBar.getConfig()).hideDelay); // TODO fix generics to spare these damn casts... is that even possible in TS?
        };

        self.events.onMouseEnter.subscribe(function(sender, args) {
            controlBar.show(); // show control bar when the mouse enters the UI

            // Clear timeout to avoid hiding the control bar if the mouse moves back into the UI during the timeout period
            clearHideTimeout();
        });
        self.events.onMouseMove.subscribe(function(sender, args) {
            if(controlBar.isHidden()) {
                controlBar.show();
            }
            if(isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }
            setHideTimeout(); // hide the control bar if mouse does not move during the timeout time
        });
        self.events.onMouseLeave.subscribe(function(sender, args) {
            if(isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }

            setHideTimeout(); // hide control bar some time after the mouse left the UI
        });
        self.events.onSeek.subscribe(function() {
            clearHideTimeout(); // DOn't hide control bar while a seek is in progress
            isSeeking = true;
        });
        self.events.onSeeked.subscribe(function() {
            isSeeking = false;
            setHideTimeout(); // hide control bar some time after a seek has finished
        });
    }

    private configureSettingsToggleButton(settingsToggleButton: SettingsToggleButton) {
        settingsToggleButton.onClick.subscribe(function(sender: SettingsToggleButton) {
            (<SettingsToggleButtonConfig>sender.getConfig()).settingsPanel.toggleHidden();
        });
    }

    private configureVideoQualitySelectBox(videoQualitySelectBox: VideoQualitySelectBox) {
        let p = this.player;
        let videoQualities = p.getAvailableVideoQualities();

        // Add entry for automatic quality switching (default setting)
        videoQualitySelectBox.addItem("auto", "auto");

        // Add video qualities
        for(let videoQuality of videoQualities) {
            videoQualitySelectBox.addItem(videoQuality.id, videoQuality.label);
        }

        videoQualitySelectBox.onItemSelected.subscribe(function(sender: VideoQualitySelectBox, value: string) {
            p.setVideoQuality(value);
        });

        // TODO update videoQualitySelectBox when video quality is changed from outside (through the API)
        // TODO implement ON_VIDEO_QUALITY_CHANGED event in player API
    }

    private configureAudioQualitySelectBox(audioQualitySelectBox: AudioQualitySelectBox) {
        let p = this.player;


        let updateAudioQualities = function () {
            let audioQualities = p.getAvailableAudioQualities();

            audioQualitySelectBox.clearItems();

            // Add entry for automatic quality switching (default setting)
            audioQualitySelectBox.addItem("auto", "auto");

            // Add audio qualities
            for(let audioQuality of audioQualities) {
                audioQualitySelectBox.addItem(audioQuality.id, audioQuality.label);
            }
        };

        audioQualitySelectBox.onItemSelected.subscribe(function(sender: AudioQualitySelectBox, value: string) {
            p.setAudioQuality(value);
        });

        p.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, updateAudioQualities);
        // TODO update audioQualitySelectBox when audio quality is changed from outside (through the API)
        // TODO implement ON_AUDIO_QUALITY_CHANGED event in player API

        updateAudioQualities();
    }

    private configureAudioTrackSelectBox(audioTrackSelectBox: AudioTrackSelectBox) {
        let p = this.player;
        let audioTracks = p.getAvailableAudio();

        // Add audio qualities
        for(let audioTrack of audioTracks) {
            audioTrackSelectBox.addItem(audioTrack.id, audioTrack.label);
        }

        audioTrackSelectBox.onItemSelected.subscribe(function(sender: AudioTrackSelectBox, value: string) {
            p.setAudio(value);
        });

        let audioTrackHandler = function () {
            let currentAudioTrack = p.getAudio();
            audioTrackSelectBox.selectItem(currentAudioTrack.id);
        };

        p.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, audioTrackHandler);
    }

    static Factory = class {
        static buildDefaultUI(player: any): UIManager {
            let ui = UIManager.Factory.assembleDefaultUI();
            let manager = new UIManager(player, ui);
            return manager;
        }

        private static assembleDefaultUI(): Wrapper {
            var playbackToggleButton = new PlaybackToggleButton();
            var fullscreenToggleButton = new FullscreenToggleButton();
            var vrToggleButton = new VRToggleButton();
            var volumeToggleButton = new VolumeToggleButton();
            var timeLabel = new PlaybackTimeLabel();
            var seekBarLabel = new SeekBarLabel();
            var seekBar = new SeekBar({label: seekBarLabel});
            var volumeControlBar = new VolumeControlBar();

            var settingsPanel = new SettingsPanel({
                components: [
                    // TODO handle the containers internally in the settings panel? Will it always be two items per row?
                    new Container({components: [new Label({text: 'Video Quality'}), new VideoQualitySelectBox()]}),
                    new Container({components: [new Label({text: 'Audio Track'}), new AudioTrackSelectBox()]}),
                    new Container({components: [new Label({text: 'Audio Quality'}), new AudioQualitySelectBox()]})
                ],
                hidden: true
            });
            var settingsToggleButton = new SettingsToggleButton({settingsPanel: settingsPanel});

            var controlBar = new ControlBar({
                components: [settingsPanel, playbackToggleButton, seekBar, timeLabel,
                    vrToggleButton, volumeToggleButton, volumeControlBar, settingsToggleButton, fullscreenToggleButton]
            });
            var watermark = new Watermark();
            var hugePlaybackToggleButton = new HugePlaybackToggleButton();
            var ui = new Wrapper({components: [hugePlaybackToggleButton, controlBar, watermark], cssClasses: ['ui-skin-default']});
            console.log(ui);

            return ui;
        }
    }
}

import {Wrapper} from "./components/wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./components/component";
import {Container, ContainerConfig} from "./components/container";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar} from "./components/seekbar";

declare var bitmovin: any;

export class UIManager {

    private player: any;
    private ui: Component<ComponentConfig>;

    constructor(player: any, ui: Wrapper) {
        this.player = player;
        this.ui = ui;

        let playerId = player.getFigure().parentElement.id;

        // Add UI elements to player
        DOM.JQuery(`#${playerId}`).append(ui.getDomElement());

        this.configureControls(ui);
    }

    private configureControls(component: Component<ComponentConfig>) {
        if (component instanceof PlaybackToggleButton) {
            this.configurePlaybackToggleButton(component);
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
        else if (component instanceof Container) {
            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }

    private configurePlaybackToggleButton(playbackToggleButton: PlaybackToggleButton) {
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
        p.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED , playbackStateHandler);

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
        p.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackPositionHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_STOP_BUFFERING, playbackPositionHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler);
        p.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler);

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
}
import {ToggleButton, ToggleButtonConfig} from "./togglebutton";
import {UIManager} from "../uimanager";

export class PlaybackToggleButton extends ToggleButton<ToggleButtonConfig> {

    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-playbacktogglebutton',
            text: 'Play/Pause'
        }, this.config);
    }


    configure(player: bitmovin.player.Player, uimanager: UIManager, handleClickEvent: boolean = true): void {
        let self = this;
        let isSeeking = false;

        // Handler to update button state based on player state
        let playbackStateHandler = function () {
            // If the UI is currently seeking, playback is temporarily stopped but the buttons should
            // not reflect that and stay as-is (e.g indicate playback while seeking).
            if(isSeeking) {
                return;
            }

            if (player.isPlaying()) {
                self.on();
            } else {
                self.off();
            }
        };

        // Call handler upon these events
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_PAUSE, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler); // when playback finishes, player turns to paused mode

        if(handleClickEvent) {
            // Control player by button events
            // When a button event triggers a player API call, events are fired which in turn call the event handler
            // above that updated the button state.
            self.onClick.subscribe(function () {
                if (player.isPlaying()) {
                    player.pause();
                } else {
                    player.play();
                }
            });
        }

        // Track UI seeking status
        uimanager.events.onSeek.subscribe(function () {
            isSeeking = true;
        });
        uimanager.events.onSeeked.subscribe(function () {
            isSeeking = false;
        });
    }
}
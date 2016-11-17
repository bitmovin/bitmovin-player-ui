import {LabelConfig, Label} from "./label";
import {UIManager} from "../uimanager";
declare var require: any;

/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
export class PlaybackTimeLabel extends Label<LabelConfig> {

    private numeral = require('numeral');

    constructor(config: LabelConfig = {}) {
        super(config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        let playbackTimeHandler = function () {
            if(player.getDuration() == Infinity) {
                self.setText('Live');
            } else {
                self.setTime(player.getCurrentTime(), player.getDuration());
            }
        };

        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, playbackTimeHandler);

        // Init time display (when the UI is initialized, it's too late for the ON_READY event)
        playbackTimeHandler();
    }

    setTime(playbackSeconds: number, durationSeconds: number) {
        this.setText(`${this.numeral(playbackSeconds).format('00:00:00')} / ${this.numeral(durationSeconds).format('00:00:00')}`);
    }
}
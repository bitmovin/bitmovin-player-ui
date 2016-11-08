import {LabelConfig, Label} from "./label";
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

    setTime(playbackSeconds: number, durationSeconds: number) {
        this.setText(`${this.numeral(playbackSeconds).format('00:00:00')} / ${this.numeral(durationSeconds).format('00:00:00')}`);
    }
}
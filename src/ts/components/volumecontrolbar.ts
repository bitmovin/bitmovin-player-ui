import {SeekBar, SeekBarConfig} from "./seekbar";


export class VolumeControlBar extends SeekBar {

    constructor(config: SeekBarConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumecontrolbar'
        });
    }
}
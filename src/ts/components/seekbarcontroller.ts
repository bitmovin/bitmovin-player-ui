import { UIUtils } from '../uiutils';
import { DOM } from '../dom';
import { PlayerAPI } from 'bitmovin-player';
import { VolumeController } from '../volumecontroller';

export enum SeekBarType {
    Vod,
    Live,
    Volume,
}

interface Range {
    min: number;
    max: number;
}

interface KeyStepIncrementsConfig {
    leftRight: number;
    upDown: number;
}

const coerceValueIntoRange = (
    value: number,
    range: Range,
    cb: (value: number) => void,
) => {
    if (value < range.min) {
        cb(range.min);
    } else if (value > range.max) {
        cb(range.max);
    } else {
        cb(value);
    }
};

export class SeekBarController {
    protected keyStepIncrements: KeyStepIncrementsConfig;
    protected player: PlayerAPI;
    protected volumeController: VolumeController;

    constructor(
        keyStepIncrements: KeyStepIncrementsConfig,
        player: PlayerAPI,
        volumeController: VolumeController,
    ) {
        this.keyStepIncrements = keyStepIncrements;
        this.player = player;
        this.volumeController = volumeController;
    }

    protected arrowKeyControls(
        currentValue: number,
        range: Range,
        valueUpdate: (value: number) => void,
    ) {
        const controlValue = Math.floor(currentValue);

        return {
            left: () => coerceValueIntoRange(controlValue - this.keyStepIncrements.leftRight, range, valueUpdate),
            right: () => coerceValueIntoRange(controlValue + this.keyStepIncrements.leftRight, range, valueUpdate),
            up: () => coerceValueIntoRange(controlValue + this.keyStepIncrements.upDown, range, valueUpdate),
            down: () => coerceValueIntoRange(controlValue - this.keyStepIncrements.upDown, range, valueUpdate),
            home: () => coerceValueIntoRange(range.min, range, valueUpdate),
            end: () => coerceValueIntoRange(range.max, range, valueUpdate),
        };
    }

    protected seekBarControls(type: SeekBarType) {
        if (type === SeekBarType.Live) {
            return this.arrowKeyControls(this.player.getTimeShift(), { min: this.player.getMaxTimeShift(), max: 0 }, this.player.timeShift);
        } else if (type === SeekBarType.Vod) {
            return this.arrowKeyControls(this.player.getCurrentTime(), { min: 0, max: this.player.getDuration() }, this.player.seek);
        } else if (type === SeekBarType.Volume && this.volumeController != null) {
            const volumeTransition = this.volumeController.startTransition();
            return this.arrowKeyControls(this.player.getVolume(), { min: 0, max: 100 }, volumeTransition.finish.bind(volumeTransition));
        }
    }

    public setSeekBarControls(domElement: DOM, type: () => SeekBarType) {
        domElement.on('keydown', (e: KeyboardEvent) => {
            const controls = this.seekBarControls(type());
            switch (e.keyCode) {
                case UIUtils.KeyCode.LeftArrow: {
                    controls.left();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.RightArrow: {
                    controls.right();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.UpArrow: {
                    controls.up();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.DownArrow: {
                    controls.down();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.Home: {
                    controls.home();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.End: {
                    controls.end();
                    e.preventDefault();
                    break;
                }
                case UIUtils.KeyCode.Space: {
                    this.player.isPlaying() ? this.player.pause() : this.player.play();
                    e.preventDefault();
                    break;
                }
            }
        });
    }
}
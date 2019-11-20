import { UIUtils } from '../uiutils';
import { DOM } from '../dom';
import { PlayerAPI } from 'bitmovin-player';

export enum SeekBarType {
    Vod,
    Live,
    Volume
}

const upDownSeekValues = 5;
const leftRightSeekValues = 1;

const changeRangeValue = (
    value: number,
    range: { min: number, max: number },
    cb: (value: number) => void,
) => {
    if (value < range.min) {
        cb(range.min);
    } else if (value > range.max) {
        cb(range.max);
    } else {
        cb(value);
    }
}

const arrowKeyControls = (
    currentValue: number,
    range: { min: number, max: number },
    valueUpdate: (number: number) => void
) => {
    const controlValue = Math.floor(currentValue);

    return {
        left: () => changeRangeValue(controlValue - leftRightSeekValues, range, valueUpdate),
        right: () => changeRangeValue(controlValue + leftRightSeekValues, range, valueUpdate),
        up: () => changeRangeValue(controlValue + upDownSeekValues, range, valueUpdate),
        down: () => changeRangeValue(controlValue - upDownSeekValues, range, valueUpdate)
    }
};

const seekBarControls = (type: SeekBarType, player: PlayerAPI) => {
    if (type === SeekBarType.Live) {
        return arrowKeyControls(player.getTimeShift(), { min: player.getMaxTimeShift(), max: 0 }, player.timeShift);
    } else if (type === SeekBarType.Vod) {
        return arrowKeyControls(player.getCurrentTime(), { min: 0, max: player.getDuration() }, player.seek);
    } else {
        return arrowKeyControls(player.getVolume(), { min: 0, max: 100 }, player.setVolume);
    }
}

export const setSeekBarControls = (domElement: DOM, type: () => SeekBarType, player: PlayerAPI) => {
    domElement.on('keydown', (e: KeyboardEvent) => {
        const controls = seekBarControls(type(), player);

        if (e.keyCode === UIUtils.KeyCode.LeftArrow) {
            controls.left();
            e.preventDefault();
        } else if (e.keyCode === UIUtils.KeyCode.RightArrow) {
            controls.right();
            e.preventDefault();
        } else if (e.keyCode === UIUtils.KeyCode.UpArrow) {
            controls.up();
            e.preventDefault();
        } else if (e.keyCode === UIUtils.KeyCode.DownArrow) {
            controls.down();
            e.preventDefault();
        }
    });
}
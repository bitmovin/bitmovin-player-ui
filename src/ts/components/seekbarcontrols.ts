import { UIUtils } from '../uiutils';
import { DOM } from '../dom';
import { PlayerAPI } from 'bitmovin-player';
import { VolumeController } from '../volumecontroller';

export enum SeekBarType {
    Vod,
    Live,
    Volume,
}

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
};

const arrowKeyControls = (
    currentValue: number,
    range: { min: number, max: number },
    keyStepIncrements: { leftRight: number, upDown: number },
    valueUpdate: (value: number) => void,
) => {
    const controlValue = Math.floor(currentValue);

    return {
        left: () => changeRangeValue(controlValue - keyStepIncrements.leftRight, range, valueUpdate),
        right: () => changeRangeValue(controlValue + keyStepIncrements.leftRight, range, valueUpdate),
        up: () => changeRangeValue(controlValue + keyStepIncrements.upDown, range, valueUpdate),
        down: () => changeRangeValue(controlValue - keyStepIncrements.upDown, range, valueUpdate),
        home: () => changeRangeValue(range.min, range, valueUpdate),
        end: () => changeRangeValue(range.max, range, valueUpdate),
    };
};

const seekBarControls = (
    type: SeekBarType,
    keyStepIncrements: { leftRight: number, upDown: number },
    player: PlayerAPI,
    volumeController: VolumeController,
) => {
    if (type === SeekBarType.Live) {
        return arrowKeyControls(player.getTimeShift(), { min: player.getMaxTimeShift(), max: 0 }, keyStepIncrements, player.timeShift);
    } else if (type === SeekBarType.Vod) {
        return arrowKeyControls(player.getCurrentTime(), { min: 0, max: player.getDuration() }, keyStepIncrements, player.seek);
    } else if (type === SeekBarType.Volume && volumeController != null) {
        const volumeTransition = volumeController.startTransition();
        return arrowKeyControls(player.getVolume(), { min: 0, max: 100 }, keyStepIncrements, volumeTransition.finish.bind(volumeTransition));
    }
};

export const setSeekBarControls = (
    domElement: DOM,
    type: () => SeekBarType,
    keyStepIncrements: { leftRight: number, upDown: number },
    player: PlayerAPI,
    volumeController: VolumeController,
) => {
    domElement.on('keydown', (e: KeyboardEvent) => {
        const controls = seekBarControls(type(), keyStepIncrements, player, volumeController);

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
                player.isPlaying() ? player.pause() : player.play();
                e.preventDefault();
                break;
            }
        }
    });
};

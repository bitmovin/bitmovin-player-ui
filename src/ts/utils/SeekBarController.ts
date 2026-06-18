import { UIUtils } from './UIUtils';
import { DOM } from '../DOM';
import { PlayerAPI } from 'bitmovin-player';
import { VolumeController } from './VolumeController';

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

const coerceValueIntoRange = (value: number, range: Range, cb: (value: number) => void) => {
  if (value < range.min) {
    cb(range.min);
  } else if (value > range.max) {
    cb(range.max);
  } else {
    cb(value);
  }
};

/**
 * @category Utils
 */
export class SeekBarController {
  protected keyStepIncrements: KeyStepIncrementsConfig;
  protected player: PlayerAPI;
  protected volumeController: VolumeController;

  constructor(keyStepIncrements: KeyStepIncrementsConfig, player: PlayerAPI, volumeController: VolumeController) {
    this.keyStepIncrements = keyStepIncrements;
    this.player = player;
    this.volumeController = volumeController;
  }

  protected arrowKeyControls(currentValue: number, range: Range, valueUpdate: (value: number) => void) {
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
      return this.arrowKeyControls(
        this.player.getTimeShift(),
        { min: this.player.getMaxTimeShift(), max: 0 },
        (value: number) => this.player.timeShift(value),
      );
    } else if (type === SeekBarType.Vod) {
      return this.arrowKeyControls(
        this.player.getCurrentTime(),
        { min: 0, max: this.player.getDuration() },
        (value: number) => this.player.seek(value),
      );
    } else if (type === SeekBarType.Volume && this.volumeController != null) {
      const volumeTransition = this.volumeController.startTransition();
      return this.arrowKeyControls(
        this.player.getVolume(),
        { min: 0, max: 100 },
        volumeTransition.finish.bind(volumeTransition),
      );
    }
  }

  public setSeekBarControls(domElement: DOM, type: () => SeekBarType) {
    domElement.on('keydown', (e: KeyboardEvent) => {
      const seekBarType = type();
      const controls = this.seekBarControls(seekBarType);
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
        case UIUtils.KeyCode.Comma: {
          if (seekBarType !== SeekBarType.Volume) {
            this.stepFrame(-1);
            e.preventDefault();
          }
          break;
        }
        case UIUtils.KeyCode.Period: {
          if (seekBarType !== SeekBarType.Volume) {
            this.stepFrame(1);
            e.preventDefault();
          }
          break;
        }
      }
    });
  }

  /**
   * Steps the playback position by one frame in the given direction (-1 = back, 1 = forward).
   * Pauses the player first if necessary so the step lands on a stable frame. The frame
   * duration is derived from the active video quality's `frameRate` and falls back to
   * 30 fps when the player doesn't expose one (e.g. progressive sources).
   *
   * Only supported for VOD: on live streams `timeShift` is measured against the constantly
   * advancing live edge, and `getTimeShift()` is not a stable reference while paused, so a
   * sub-frame step gets swamped by the edge movement and the position drifts forward instead
   * of stepping. Live frame stepping needs absolute-time seeking on the player side.
   */
  protected stepFrame(direction: number): void {
    if (this.player.isLive()) {
      return;
    }
    if (!this.player.isPaused()) {
      this.player.pause('ui');
    }
    const target = Math.max(0, this.player.getCurrentTime() + direction / this.getFrameRate());
    this.player.seek(target);
  }

  private getFrameRate(): number {
    const frameRate = this.player.getPlaybackVideoData()?.frameRate;
    return typeof frameRate === 'number' && frameRate > 0 ? frameRate : 30;
  }
}

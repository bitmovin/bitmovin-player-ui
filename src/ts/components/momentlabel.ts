import {LabelConfig, Label} from './label';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

interface Moment {
  startFrameNumber: number;
  endFrameNumber: number;
}

export class MomentLabel extends Label<LabelConfig> {
  private nextMomentIndex = 0;

  constructor(config: LabelConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['label-moment'],
    } as LabelConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let unload = () => {
      this.setText(null);
    };

    const updateMoment = () => {
      const nextMoment = player.getSource()?.metadata?.nifty?.moments?.[this.nextMomentIndex];
      if (nextMoment) {
        this.setText(nextMoment.title);
        if (player.getSource().metadata.nifty.moments.length > this.nextMomentIndex + 1) {
          this.nextMomentIndex = this.nextMomentIndex + 1;
        }
      }
    };

    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);
    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      if (player.getSource().metadata?.nifty?.moments) {
        const currentFrameish = Math.round(player.getCurrentTime() * 24);
        this.nextMomentIndex = player.getSource().metadata.nifty.moments.findIndex((moment: Moment) => moment.startFrameNumber <= currentFrameish && moment.endFrameNumber >= currentFrameish) ?? 0;
        updateMoment();
      }
    });
    // @ts-ignore
    player.on(player.exports.PlayerEvent.TimeChanged, ({ time }) => {
      if (player.getSource()?.metadata?.nifty?.moments) {
        const frameApproximation = Math.round(time * 24);
        const nextMoment = player.getSource().metadata.nifty.moments[this.nextMomentIndex];

        if (nextMoment && nextMoment.startFrameNumber <= frameApproximation && nextMoment.endFrameNumber >= frameApproximation) {
          updateMoment();
        }
      }
    });
  }
}
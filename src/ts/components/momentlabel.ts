import { LabelConfig, Label } from './label';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

interface Moment {
  title: string;
  startFrameNumber: number;
  endFrameNumber: number;
}

export class MomentLabel extends Label<LabelConfig> {
  private nextMomentIndex = 0;

  constructor(config: LabelConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['label-moment'],
      } as LabelConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let unload = () => {
      this.setText(null);
    };

    const updateMoment = () => {
      const moments = getMoments(player);
      if (moments && moments.length > 0) {
        const nextMoment = moments[this.nextMomentIndex];
        this.setText(nextMoment.title);
        if (moments.length > this.nextMomentIndex + 1) {
          this.nextMomentIndex = this.nextMomentIndex + 1;
        }
      }
    };

    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);
    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      const moments = getMoments(player);
      if (moments && moments.length > 0) {
        const currentFrameish = Math.round(player.getCurrentTime() * 24);
        this.nextMomentIndex =
          moments.findIndex((moment: Moment) => {
            return moment.startFrameNumber <= currentFrameish && moment.endFrameNumber >= currentFrameish;
          }) ?? 0;
        updateMoment();
      }
    });
    // @ts-ignore
    player.on(player.exports.PlayerEvent.TimeChanged, ({ time }) => {
      const moments = getMoments(player);
      if (moments && moments.length > 0) {
        const frameApproximation = Math.round(time * 24);
        const nextMoment = moments[this.nextMomentIndex];

        if (
          nextMoment &&
          nextMoment.startFrameNumber <= frameApproximation &&
          nextMoment.endFrameNumber >= frameApproximation
        ) {
          updateMoment();
        }
      }
    });
  }
}

function getMoments(player: PlayerAPI): undefined | Moment[] {
  return (player.getSource()?.metadata as any)?.nifty?.moments;
}

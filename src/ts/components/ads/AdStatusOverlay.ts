import { Container, ContainerConfig } from '../Container';
import { AdSkipButton } from './AdSkipButton';
import { Spacer } from '../Spacer';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';

export class AdStatusOverlay extends Container<ContainerConfig> {
  public readonly adSkipButton: AdSkipButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.adSkipButton = new AdSkipButton();

    this.config = this.mergeConfig(
      config,
      {
        components: [
          new Container({
            components: [new Spacer(), this.adSkipButton],
            cssClasses: ['bar'],
          }),
        ],
        cssClass: 'ui-ad-status-overlay',
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);
  }
}

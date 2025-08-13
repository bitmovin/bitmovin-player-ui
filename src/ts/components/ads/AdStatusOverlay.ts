import { Container, ContainerConfig } from '../Container';
import { AdSkipButton } from './AdSkipButton';
import { Spacer } from '../Spacer';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { Component, ComponentConfig } from '../Component';
import { AdControlBar } from './AdControlBar';
import { ControlBar } from '../ControlBar';

export class AdStatusOverlay extends Container<ContainerConfig> {
  private static readonly CLASS_CONTROLBAR_VISIBLE = 'controlbar-visible';

  public readonly adSkipButton: AdSkipButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.adSkipButton = new AdSkipButton();

    this.config = this.mergeConfig(
      config,
      {
        components: [
          new Container({
            components: [
              new Spacer(),
              this.adSkipButton,
            ],
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

    uimanager.onComponentShow.subscribe((component: Component<ComponentConfig>) => {
      // console.log('[test] AdStatusOverlay component show', component);
      // if (component instanceof AdControlBar) {// WHY ??
      if (component.getDomElement().hasClass(this.prefixCss('ad-controlbar-bottom'))) {
        console.log('[test] NICE show!');
        this.getDomElement().addClass(this.prefixCss(AdStatusOverlay.CLASS_CONTROLBAR_VISIBLE));
      }
    });
    uimanager.onComponentHide.subscribe((component: Component<ComponentConfig>) => {
      // console.log('[test] AdStatusOverlay component hide', component);
      // if (component instanceof AdControlBar) {
      if (component.getDomElement().hasClass(this.prefixCss('ad-controlbar-bottom'))) {
        console.log('[test] NICE hide!');
        this.getDomElement().removeClass(this.prefixCss(AdStatusOverlay.CLASS_CONTROLBAR_VISIBLE));
      }
    });
  }
}

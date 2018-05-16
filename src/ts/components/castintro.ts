import {UIInstanceManager} from '../uimanager';
import {Button, ButtonConfig} from './button';

const lsKey = 'cast_intro';

/**
 * A click overlay that opens an url in a new tab if clicked.
 */
export class CastIntro extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    const hide = !!window.localStorage.getItem(lsKey);
    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-castintro', `${!hide ? 'ui-castintro--active' : ''}`],
      text: 'Click to cast videos to your TV',
    }, <ButtonConfig>this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    player.addEventHandler(player.EVENT.ON_CAST_STARTED, () => {
      let element = this.getDomElement();
      element.removeClass('bmpui-ui-castintro--active');
      window.localStorage.setItem(lsKey, 'true');
    });
  }

  initialize(): void {
    super.initialize();

    let element = this.getDomElement();
    element.on('click', () => {
      element.removeClass('bmpui-ui-castintro--active');
    });
    window.localStorage.setItem(lsKey, 'true');
  }
}
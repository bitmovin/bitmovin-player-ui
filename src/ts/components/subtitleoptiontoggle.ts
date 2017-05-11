import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {SubtitleOptions} from './subtitleoptions';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';

/** 
 * Configuration interface for the {@link SubtitleOptionsToggle}
 */
export interface SubtitleOptionsToggleConfig extends ToggleButtonConfig {
  /**
   * The option panel whose visibility the button should toggle
   */
  subtitleoptions: SubtitleOptions
}
/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleOptionsToggle extends ToggleButton<SubtitleOptionsToggleConfig> {

  constructor(config: SubtitleOptionsToggleConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitleoptiontoggle',
      text: 'Subtitles options',
      subtitleoptions: null,
    }, <SubtitleOptionsToggleConfig>this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SubtitleOptionsToggleConfig>this.getConfig();
    let subtitleoptions = config.subtitleoptions

    this.onClick.subscribe(() => {
      subtitleoptions.toggleHidden();
    });
    subtitleoptions.onShow.subscribe(() => {
      // Set toggle status to on when the settings panel shows
      this.on();
    });
    subtitleoptions.onHide.subscribe(() => {
      // Set toggle status to off when the settings panel hides
      this.off();
    });
  }
}

import { UIInstanceManager } from '../../UIManager';
import { SettingsPanelPageNavigatorButton, SettingsPanelPageNavigatorConfig } from './SettingsPanelPageNavigatorButton';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { ButtonStyle } from '../buttons/Button';

/**
 * @category Buttons
 */
export class SettingsPanelPageBackButton extends SettingsPanelPageNavigatorButton {
  constructor(config: SettingsPanelPageNavigatorConfig) {
    super(config);

    const pageTitle = config.text;

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settingspanelpagebackbutton',
        text: i18n.getLocalizer('back'),
        buttonStyle: ButtonStyle.TextWithLeadingIcon,
        // When the button shows a page title instead of "Back", announce it as a back control as well. The name starts
        // with the visible title so it can still be targeted by speech input.
        ariaLabel: pageTitle
          ? () => i18n.getLocalizer('settings.page.back', { title: i18n.performLocalization(pageTitle) })()
          : undefined,
      } as SettingsPanelPageNavigatorConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.popPage();
    });
  }
}

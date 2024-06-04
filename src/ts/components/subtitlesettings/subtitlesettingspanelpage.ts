import {SettingsPanelPage} from '../settingspanelpage';
import {SettingsPanel} from '../settingspanel';
import {SubtitleOverlay} from '../subtitleoverlay';
import {ContainerConfig} from '../container';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {Component, ComponentConfig} from '../component';
import {FontSizeSelectBox} from './fontsizeselectbox';
import {FontFamilySelectBox} from './fontfamilyselectbox';
import {FontColorSelectBox} from './fontcolorselectbox';
import {FontOpacitySelectBox} from './fontopacityselectbox';
import {CharacterEdgeSelectBox} from './characteredgeselectbox';
import {BackgroundColorSelectBox} from './backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox';
import {WindowColorSelectBox} from './windowcolorselectbox';
import {WindowOpacitySelectBox} from './windowopacityselectbox';
import {SubtitleSettingsResetButton} from './subtitlesettingsresetbutton';
import {UIInstanceManager} from '../../uimanager';
import {SettingsPanelPageBackButton} from '../settingspanelpagebackbutton';
import {SettingsPanelItem} from '../settingspanelitem';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

export interface SubtitleSettingsPanelPageConfig extends ContainerConfig {
  settingsPanel: SettingsPanel;
  overlay: SubtitleOverlay;
}

export class SubtitleSettingsPanelPage extends SettingsPanelPage {

  private readonly overlay: SubtitleOverlay;
  private readonly settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsPanelPageConfig) {
    super(config);

    this.overlay = config.overlay;
    this.settingsPanel = config.settingsPanel;


    this.config = this.mergeConfig(config, {
      components: <Component<ComponentConfig>[]>[
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.font.size'), new FontSizeSelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.font.family'), new FontFamilySelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.font.color'), new FontColorSelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.font.opacity'), new FontOpacitySelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.characterEdge'), new CharacterEdgeSelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.background.color'), new BackgroundColorSelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.background.opacity'), new BackgroundOpacitySelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.window.color'), new WindowColorSelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(i18n.getLocalizer('settings.subtitles.window.opacity'), new WindowOpacitySelectBox({
          overlay: this.overlay,
        })),
        new SettingsPanelItem(new SettingsPanelPageBackButton({
          container: this.settingsPanel,
          text: i18n.getLocalizer('back'),
        }), new SubtitleSettingsResetButton({}), {
          role: 'menubar',
        }),
      ],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onActive.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();
    });

    this.onInactive.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }
}
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
import { LocalizerType } from '../../localization';

export interface SubtitleSettingsPanelPageConfig extends ContainerConfig {
  settingsPanel: SettingsPanel;
  overlay: SubtitleOverlay;
  localize: LocalizerType;
}

export class SubtitleSettingsPanelPage extends SettingsPanelPage {

  private readonly overlay: SubtitleOverlay;
  private readonly settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsPanelPageConfig) {
    super(config);

    const { localize } = config;
    this.overlay = config.overlay;
    this.settingsPanel = config.settingsPanel;

    let manager = new SubtitleSettingsManager();

    this.config = this.mergeConfig(config, {
      components: <Component<ComponentConfig>[]>[
        new SettingsPanelItem(localize('settings.subtitles.font.size'), new FontSizeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.font.family'), new FontFamilySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.font.color'), new FontColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.font.opacity'), new FontOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.characterEdge'), new CharacterEdgeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.background.color'), new BackgroundColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.background.opacity'), new BackgroundOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.window.color'), new WindowColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(localize('settings.subtitles.window.opacity'), new WindowOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(new SettingsPanelPageBackButton({
          container: this.settingsPanel,
          text: localize('settings.back'),
        }), new SubtitleSettingsResetButton({
          settingsManager: manager,
        })),
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

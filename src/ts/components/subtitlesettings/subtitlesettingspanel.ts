import {SettingsPanel, SettingsPanelConfig, SettingsPanelItem} from '../settingspanel';
import {FontColorSelectBox} from './fontcolorselectbox';
import {FontOpacitySelectBox} from './fontopacityselectbox';
import {FontFamilySelectBox} from './fontfamilyselectbox';
import {FontSizeSelectBox} from './fontsizeselectbox';
import {BackgroundColorSelectBox} from './backgroundcolorselectbox';
import {BackgroundOpacitySelectBox} from './backgroundopacityselectbox';
import {WindowColorSelectBox} from './windowcolorselectbox';
import {WindowOpacitySelectBox} from './windowopacityselectbox';
import {CharacterEdgeSelectBox} from './characteredgeselectbox';
import {SubtitleOverlay} from '../subtitleoverlay';
import {Component, ComponentConfig} from '../component';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleSettingsManager} from './subtitlesettingsmanager';
import {SubtitleSettingsCloseButton} from './subtitlesettingsclosebutton';
import {SubtitleSettingsResetButton} from './subtitlesettingsresetbutton';
import i18n from '../../i18n';

// Interfaces and types
import { FontPanelLabels } from '../../translations/translation-types';

export interface SubtitleSettingsPanelConfig extends SettingsPanelConfig {
  overlay: SubtitleOverlay;
  settingsPanel: SettingsPanel;
}

/**
 * SubtitleSettingsPanel is a settings panel specific to subtitles settings
 **/
export class SubtitleSettingsPanel extends SettingsPanel {

  private overlay: SubtitleOverlay;

  constructor(config: SubtitleSettingsPanelConfig) {
    super(config);

    this.overlay = config.overlay;

    let manager = new SubtitleSettingsManager();
    // Quick lang getters
    const i18fonts: FontPanelLabels = i18n.q.settings.fonts;

    this.config = this.mergeConfig(config, {
      components: <Component<ComponentConfig>[]>[
        new SettingsPanelItem(i18fonts.fontSize, new FontSizeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.fontFamily, new FontFamilySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.fontColor, new FontColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.fontOpacity, new FontOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.characterEdge, new CharacterEdgeSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.backgroundColor, new BackgroundColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.backgroundOpacity, new BackgroundOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.windowColor, new WindowColorSelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(i18fonts.windowOpacity, new WindowOpacitySelectBox({
          overlay: this.overlay, settingsManager: manager,
        })),
        new SettingsPanelItem(new SubtitleSettingsCloseButton({
          subtitleSettingsPanel: this, settingsPanel: config.settingsPanel,
        }), new SubtitleSettingsResetButton({
          settingsManager: manager,
        })),
      ],
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onShow.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();
    });

    this.onHide.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }
}

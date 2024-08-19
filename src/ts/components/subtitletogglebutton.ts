import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { i18n } from '../localization/i18n';
import { PlayerAPI, SubtitleTrack } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { StorageUtils } from '../storageutils';
import { SubtitleSelectBox } from './subtitleselectbox';
import { prefixCss } from './dummycomponent';
import { SubtitleSwitchHandler } from '../subtitleutils';
import { ModernSettingsPanelItem } from './modernsettingspanelitem';

export interface StoredSubtitleLanguage {
    language: string;
    active: boolean;
}

export class SubtitleToggleButton extends ToggleButton<ToggleButtonConfig> {
  /**
   * Requires the settingsPanelItem which holds the SubtitleSelectBox in its setting
   */
    private settingsPanelItem: ModernSettingsPanelItem;
    private subtitleSelectBox: SubtitleSelectBox;
    private player: PlayerAPI;

    constructor(settingsPanelItem: ModernSettingsPanelItem, subtitleSelectBox: SubtitleSelectBox, config: ToggleButtonConfig = {}) {
        super(config);

        this.settingsPanelItem = settingsPanelItem;
        this.subtitleSelectBox = subtitleSelectBox;

        const defaultConfig: ToggleButtonConfig = {
            cssClass: 'ui-subtitletogglebutton',
            onClass: 'subtitles-on',
            offClass: 'subtitles-off',
            text: i18n.getLocalizer('settings.subtitles'),
            ariaLabel: i18n.getLocalizer('settings.subtitles'),
        };

        this.config = this.mergeConfig(config, defaultConfig, this.config);
    }

    configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
        super.configure(player, uimanager);
        this.player = player;
        this.hide();
        this.initPlayerEvents();

        this.onClick.subscribe(() => {
            const availableSubtitles = player.subtitles.list();
            const storedSubtitle: StoredSubtitleLanguage = StorageUtils.getObject(prefixCss('subtitlelanguage'));
            const subtitleTrack = storedSubtitle ? availableSubtitles.find(e => e.lang === storedSubtitle.language) : undefined;
            if (!subtitleTrack) {
                this.settingsPanelItem.displayItemsSubPage();
            } else if (this.isOff() && subtitleTrack) {
                this.on();
                player.subtitles.enable(subtitleTrack.id);
                SubtitleSwitchHandler.setSubtitleLanguageStorage(this.player, subtitleTrack.id);
            } else {
                this.off();
                player.subtitles.disable(subtitleTrack.id);
                SubtitleSwitchHandler.setSubtitleLanguageStorage(this.player);
            }
        });

        // when user enables/disables a subtitle in the select box, the subtitletogglebutton will change its appearance accordingly
        this.subtitleSelectBox.onItemSelected.subscribe((_, value: string) => {
            player.subtitles.list().find(e => e.id === value) ? this.on() : this.off();
        });
    }

    private initPlayerEvents = () => {
        this.player.on(this.player.exports.PlayerEvent.SubtitleAdded, this.onAvailableSubtitlesChanged);
        this.player.on(this.player.exports.PlayerEvent.SubtitleRemoved, this.onAvailableSubtitlesChanged);
        this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, this.onAvailableSubtitlesChanged);
        this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.onAvailableSubtitlesChanged);
    }

    private onAvailableSubtitlesChanged = () => {
        const storedSubtitle: StoredSubtitleLanguage = StorageUtils.getObject(prefixCss('subtitlelanguage'));
        const subtitleList = this.player.subtitles.list();

        // only shows the button when subtitles are existing
        subtitleList.length > 0 ? this.show() : this.hide();

        // if the stored subtitle is set active and available, that subtitle is enabled
        const subtitleToActivate: SubtitleTrack = subtitleList.find(subtitle => subtitle.lang === storedSubtitle?.language);
        if (storedSubtitle?.active && subtitleToActivate) {
            this.on();
            this.player.subtitles.enable(subtitleToActivate.id);
        }
    }
}
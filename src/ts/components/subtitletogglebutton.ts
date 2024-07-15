import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { i18n } from '../localization/i18n';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { StorageUtils } from '../storageutils';
import { SubtitleSelectBox } from './subtitleselectbox';
import { SettingsPanel } from './settingspanel';


export class SubtitleToggleButton extends ToggleButton<ToggleButtonConfig> {
    private settingsPanel: SettingsPanel;
    private subtitleSelectBox: SubtitleSelectBox;
    private player: PlayerAPI;

    constructor(subtitleSettingsOpenButton: SettingsPanel, subtitleSelectBox: SubtitleSelectBox, config: ToggleButtonConfig = {}) {
        super(config);

        this.settingsPanel = subtitleSettingsOpenButton;
        this.subtitleSelectBox = subtitleSelectBox;

        const defaultConfig: ToggleButtonConfig = {
            cssClass: 'ui-subtitletogglebutton',
            onClass: 'subtitles-on',
            offClass: 'subtitles-off',
            text: i18n.getLocalizer('settings.subtitles'),
            ariaLabel: i18n.getLocalizer('settings.subtitles'),
        };

        this.config = this.mergeConfig(config, defaultConfig as ToggleButtonConfig, this.config);
    }

    configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
        super.configure(player, uimanager);
        this.player = player;
        this.hide();

        player.on(player.exports.PlayerEvent.SubtitleAdded, this.checkSubtitleAvailability);
        player.on(player.exports.PlayerEvent.SubtitleRemoved, this.checkSubtitleAvailability);

        this.onClick.subscribe(() => {
            const availableSubtitles = player.subtitles.list();
            const subtitleID = StorageUtils.getItem('bmpiu-subtitlelanguage');
            if (!subtitleID || !availableSubtitles.find(e => e.id === subtitleID)) {
                this.settingsPanel.show();
            } else if (this.isOff() && subtitleID) {
                this.on();
                player.subtitles.enable(subtitleID);
            } else {
                this.off();
                player.subtitles.disable(subtitleID);
            }
        });

        // when user enables/disables a subtitle in the select box, the subtitletogglebutton will change its appearance accordingly
        this.subtitleSelectBox.onItemSelected.subscribe((_, value: string) => {
            player.subtitles.list().find(e => e.id === value) ? this.on() : this.off();
        });
    }

    private checkSubtitleAvailability = () => {
        this.player.subtitles.list().length > 0 ? this.show() : this.hide();
    }
}
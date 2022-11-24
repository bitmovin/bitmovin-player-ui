import { SubtitleOverlay } from './components/subtitleoverlay';
import { SettingsPanelPage } from './components/settingspanelpage';
import { SettingsPanelItem } from './components/settingspanelitem';
import { VideoQualitySelectBox } from './components/videoqualityselectbox';
import { PlaybackSpeedSelectBox } from './components/playbackspeedselectbox';
import { AudioTrackSelectBox } from './components/audiotrackselectbox';
import { AudioQualitySelectBox } from './components/audioqualityselectbox';
import { SettingsPanel } from './components/settingspanel';
import { SubtitleSettingsPanelPage } from './components/subtitlesettings/subtitlesettingspanelpage';
import { SettingsPanelPageOpenButton } from './components/settingspanelpageopenbutton';
import { SubtitleSettingsLabel } from './components/subtitlesettings/subtitlesettingslabel';
import { SubtitleSelectBox } from './components/subtitleselectbox';
import { ControlBar } from './components/controlbar';
import { Container } from './components/container';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from './components/playbacktimelabel';
import { SeekBar } from './components/seekbar';
import { SeekBarLabel } from './components/seekbarlabel';
import { PlaybackToggleButton } from './components/playbacktogglebutton';
import { VolumeToggleButton } from './components/volumetogglebutton';
import { VolumeSlider } from './components/volumeslider';
import { Spacer } from './components/spacer';
import { PictureInPictureToggleButton } from './components/pictureinpicturetogglebutton';
import { AirPlayToggleButton } from './components/airplaytogglebutton';
import { CastToggleButton } from './components/casttogglebutton';
import { VRToggleButton } from './components/vrtogglebutton';
import { SettingsToggleButton } from './components/settingstogglebutton';
import { FullscreenToggleButton } from './components/fullscreentogglebutton';
import { UIContainer } from './components/uicontainer';
import { BufferingOverlay } from './components/bufferingoverlay';
import { PlaybackToggleOverlay } from './components/playbacktoggleoverlay';
import { CastStatusOverlay } from './components/caststatusoverlay';
import { TitleBar } from './components/titlebar';
import { RecommendationOverlay } from './components/recommendationoverlay';
import { Watermark } from './components/watermark';
import { ErrorMessageOverlay } from './components/errormessageoverlay';
import { AdClickOverlay } from './components/adclickoverlay';
import { AdMessageLabel } from './components/admessagelabel';
import { AdSkipButton } from './components/adskipbutton';
import { CloseButton } from './components/closebutton';
import { MetadataLabel, MetadataLabelContent } from './components/metadatalabel';
import { PlayerUtils } from './playerutils';
import { Label } from './components/label';
import { CastUIContainer } from './components/castuicontainer';
import { UIConditionContext, UIManager } from './uimanager';
import { UIConfig } from './uiconfig';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';
import { UIFactory } from './uifactory';

export namespace CustomUIFactory {

    export function buildModernSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
        return new UIManager(player, [{
            ui: UIFactory.modernSmallScreenAdsUI(),
            condition: (context: UIConditionContext) => {
                return context.isAd && context.adRequiresUi;
            },
        }, {
            ui: modernSmallScreenUI(),
            condition: (context: UIConditionContext) => {
                return !context.isAd && !context.adRequiresUi;
            },
        }], config);
    }

    export function modernSmallScreenUI() {
        let subtitleOverlay = new SubtitleOverlay();

        let mainSettingsPanelPage = new SettingsPanelPage({
            components: [
                new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
                // new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
                new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
                new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
            ],
        });

        let settingsPanel = new SettingsPanel({
            components: [
                mainSettingsPanelPage,
            ],
            hidden: true,
            pageTransitionAnimation: false,
            hideDelay: -1,
        });

        let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
            settingsPanel: settingsPanel,
            overlay: subtitleOverlay,
        });

        let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
            targetPage: subtitleSettingsPanelPage,
            container: settingsPanel,
            ariaLabel: i18n.getLocalizer('settings.subtitles'),
            text: i18n.getLocalizer('open'),
        });

        const subtitleSelectBox = new SubtitleSelectBox();

        mainSettingsPanelPage.addComponent(
            new SettingsPanelItem(
                new SubtitleSettingsLabel({
                    text: i18n.getLocalizer('settings.subtitles'),
                    opener: subtitleSettingsOpenButton,
                }),
                subtitleSelectBox,
                {
                    role: 'menubar',
                },
            ));

        settingsPanel.addComponent(subtitleSettingsPanelPage);

        settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));
        subtitleSettingsPanelPage.addComponent(new CloseButton({ target: settingsPanel }));

        let controlBar = new ControlBar({
            components: [
                new Container({
                    components: [
                        new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
                        new SeekBar({ label: new SeekBarLabel() }),
                        new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
                    ],
                    cssClasses: ['controlbar-top'],
                }),
            ],
        });

        return new UIContainer({
            components: [
                subtitleOverlay,
                new BufferingOverlay(),
                new CastStatusOverlay(),
                new PlaybackToggleOverlay(),
                new RecommendationOverlay(),
                controlBar,
                new TitleBar({
                    components: [
                        new MetadataLabel({ content: MetadataLabelContent.Title }),
                        new CastToggleButton(),
                        new VRToggleButton(),
                        new PictureInPictureToggleButton(),
                        new AirPlayToggleButton(),
                        new VolumeToggleButton(),
                        new SettingsToggleButton({ settingsPanel: settingsPanel }),
                        new FullscreenToggleButton(),
                    ],
                }),
                settingsPanel,
                // new Watermark(),
                new ErrorMessageOverlay(),
            ],
            cssClasses: ['ui-skin-smallscreen'],
            hideDelay: -1,
            hidePlayerStateExceptions: [
                PlayerUtils.PlayerState.Prepared,
                PlayerUtils.PlayerState.Paused,
                PlayerUtils.PlayerState.Finished,
            ],
        });
    }
}

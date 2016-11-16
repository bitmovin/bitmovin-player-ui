import {Wrapper} from "./components/wrapper";
import {DOM} from "./dom";
import {Component, ComponentConfig} from "./components/component";
import {Container} from "./components/container";
import {PlaybackToggleButton} from "./components/playbacktogglebutton";
import {FullscreenToggleButton} from "./components/fullscreentogglebutton";
import {VRToggleButton} from "./components/vrtogglebutton";
import {VolumeToggleButton} from "./components/volumetogglebutton";
import {SeekBar} from "./components/seekbar";
import {PlaybackTimeLabel} from "./components/playbacktimelabel";
import {HugePlaybackToggleButton} from "./components/hugeplaybacktogglebutton";
import {ControlBar} from "./components/controlbar";
import {NoArgs, EventDispatcher} from "./eventdispatcher";
import {SettingsToggleButton} from "./components/settingstogglebutton";
import {SettingsPanel} from "./components/settingspanel";
import {VideoQualitySelectBox} from "./components/videoqualityselectbox";
import {Watermark} from "./components/watermark";
import {Label} from "./components/label";
import {AudioQualitySelectBox} from "./components/audioqualityselectbox";
import {AudioTrackSelectBox} from "./components/audiotrackselectbox";
import {SeekBarLabel} from "./components/seekbarlabel";
import {VolumeControlBar} from "./components/volumecontrolbar";
import {SubtitleSelectBox} from "./components/subtitleselectbox";

export class UIManager {

    private player: bitmovin.player.Player;
    private ui: Component<ComponentConfig>;

    // TODO make these accessible from outside, might be helpful to to have UI API events too
    public events = {
        /**
         * Fires when the mouse enters the UI area.
         */
        onMouseEnter: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse moves inside the UI area.
         */
        onMouseMove: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when the mouse leaves the UI area.
         */
        onMouseLeave: new EventDispatcher<Component<ComponentConfig>, NoArgs>(),
        /**
         * Fires when a seek starts.
         */
        onSeek: new EventDispatcher<SeekBar, NoArgs>(),
        /**
         * Fires when the seek timeline is scrubbed.
         */
        onSeekPreview: new EventDispatcher<SeekBar, number>(),
        /**
         * Fires when a seek is finished.
         */
        onSeeked: new EventDispatcher<SeekBar, NoArgs>()
    };

    constructor(player: bitmovin.player.Player, ui: Wrapper) {
        this.player = player;
        this.ui = ui;

        let playerId = player.getFigure().parentElement.id;

        // Add UI elements to player
        DOM.JQuery(`#${playerId}`).append(ui.getDomElement());

        this.configureControls(ui);
    }

    private configureControls(component: Component<ComponentConfig>) {
        component.initialize();
        component.configure(this.player, this);

        if (component instanceof Container) {
            for (let childComponent of component.getComponents()) {
                this.configureControls(childComponent);
            }
        }
    }

    static Factory = class {
        static buildDefaultUI(player: any): UIManager {
            let ui = UIManager.Factory.assembleDefaultUI();
            let manager = new UIManager(player, ui);
            return manager;
        }

        private static assembleDefaultUI(): Wrapper {
            var playbackToggleButton = new PlaybackToggleButton();
            var fullscreenToggleButton = new FullscreenToggleButton();
            var vrToggleButton = new VRToggleButton();
            var volumeToggleButton = new VolumeToggleButton();
            var timeLabel = new PlaybackTimeLabel();
            var seekBarLabel = new SeekBarLabel();
            var seekBar = new SeekBar({label: seekBarLabel});
            var volumeControlBar = new VolumeControlBar();

            var settingsPanel = new SettingsPanel({
                components: [
                    // TODO handle the containers internally in the settings panel? Will it always be two items per row?
                    new Container({components: [new Label({text: 'Video Quality'}), new VideoQualitySelectBox()]}),
                    new Container({components: [new Label({text: 'Audio Track'}), new AudioTrackSelectBox()]}),
                    new Container({components: [new Label({text: 'Audio Quality'}), new AudioQualitySelectBox()]}),
                    new Container({components: [new Label({text: 'Subtitles'}), new SubtitleSelectBox()]})
                ],
                hidden: true
            });
            var settingsToggleButton = new SettingsToggleButton({settingsPanel: settingsPanel});

            var controlBar = new ControlBar({
                components: [settingsPanel, playbackToggleButton, seekBar, timeLabel,
                    vrToggleButton, volumeToggleButton, volumeControlBar, settingsToggleButton, fullscreenToggleButton]
            });
            var watermark = new Watermark();
            var hugePlaybackToggleButton = new HugePlaybackToggleButton();
            var ui = new Wrapper({components: [hugePlaybackToggleButton, controlBar, watermark], cssClasses: ['ui-skin-default']});
            console.log(ui);

            return ui;
        }
    }
}

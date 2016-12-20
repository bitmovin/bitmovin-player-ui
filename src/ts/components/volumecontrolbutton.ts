import {Container, ContainerConfig} from "./container";
import {VolumeSlider} from "./volumeslider";
import {VolumeToggleButton} from "./volumetogglebutton";
import {UIManager} from "../uimanager";
import {Timeout} from "../timeout";

/**
 * Configuration interface for a {@link VolumeControlButton}.
 */
export interface VolumeControlButtonConfig extends ContainerConfig {
    /**
     * The delay after which the volume slider will be hidden when there is no user interaction.
     * Care must be taken that the delay is long enough so users can reach the slider from the toggle button, e.g. by
     * mouse movement. If the delay is too short, the sliders disappears before the mouse pointer has reached it and
     * the user is not able to use it.
     * Default: 500ms
     */
    hideDelay?: number;
    /**
     * Specifies if the volume slider should be vertically or horizontally aligned.
     * Default: true
     */
    vertical?: boolean;
}

/**
 * A composite volume control that consists of and internally manages a volume control button that can be used
 * for muting, and a (depending on the CSS style, e.g. slide-out) volume control bar.
 */
export class VolumeControlButton extends Container<VolumeControlButtonConfig> {

    private volumeToggleButton: VolumeToggleButton;
    private volumeSlider: VolumeSlider;

    constructor(config: VolumeControlButtonConfig = {}) {
        super(config);

        this.volumeToggleButton = new VolumeToggleButton();
        this.volumeSlider = new VolumeSlider({
            vertical: config.vertical != null ? config.vertical : true,
            hidden: true
        });

        this.config = this.mergeConfig(config, {
            cssClass: "ui-volumecontrolbutton",
            components: [this.volumeToggleButton, this.volumeSlider],
            hideDelay: 500
        }, <VolumeControlButtonConfig>this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        super.configure(player, uimanager);

        let self = this;
        let volumeToggleButton = this.getVolumeToggleButton();
        let volumeSlider = this.getVolumeSlider();

        let timeout = new Timeout((<VolumeControlButtonConfig>self.getConfig()).hideDelay, function () {
            volumeSlider.hide();
        });

        /*
         * Volume Slider visibility handling
         *
         * The volume slider shall be visible while the user hovers the mute toggle button, while the user hovers the
         * volume slider, and while the user slides the volume slider. If none of these situations are true, the slider
         * shall disappear.
         */
        let volumeSliderHovered = false;
        volumeToggleButton.getDomElement().on("mouseenter", function () {
            // Show volume slider when mouse enters the button area
            if (volumeSlider.isHidden()) {
                volumeSlider.show();
            }
            // Avoid hiding of the slider when button is hovered
            timeout.clear();
        });
        volumeToggleButton.getDomElement().on("mouseleave", function () {
            // Hide slider delayed when button is left
            timeout.reset();
        });
        volumeSlider.getDomElement().on("mouseenter", function () {
            // When the slider is entered, cancel the hide timeout activated by leaving the button
            timeout.clear();
            volumeSliderHovered = true;
        });
        volumeSlider.getDomElement().on("mouseleave", function () {
            // When mouse leaves the slider, only hide it if there is no slide operation in progress
            if (volumeSlider.isSeeking()) {
                timeout.clear();
            } else {
                timeout.reset();
            }
            volumeSliderHovered = false;
        });
        volumeSlider.onSeeked.subscribe(function () {
            // When a slide operation is done and the slider not hovered (mouse outside slider), hide slider delayed
            if (!volumeSliderHovered) {
                timeout.reset();
            }
        });
    }

    /**
     * Provides access to the internally managed volume toggle button.
     * @returns {VolumeToggleButton}
     */
    getVolumeToggleButton(): VolumeToggleButton {
        return this.volumeToggleButton;
    }

    /**
     * Provides access to the internally managed volume silder.
     * @returns {VolumeSlider}
     */
    getVolumeSlider(): VolumeSlider {
        return this.volumeSlider;
    }
}
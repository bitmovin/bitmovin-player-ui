import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {i18n} from '../localization/i18n';
import {PlayerAPI} from 'bitmovin-player';
import {UIInstanceManager, UIManager} from '../uimanager';

export class Theatermodetogglebutton extends ToggleButton<ToggleButtonConfig> {
    private isTheaterMode: boolean = false;
    constructor(config: ToggleButtonConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-theatertogglebutton',
            text: i18n.getLocalizer('theater2'),
        }, this.config);
    }

    configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
        super.configure(player, uimanager);

        const theatreStateHandler = () => {
            // player.getViewMode() === player.exports.ViewMode.Fullscreen ? this.on() : this.off();
            (this.isTheaterMode) ? this.on() : this.off();
        };

        this.onClick.subscribe(() => {
            if (this.isTheaterMode) {
                this.isTheaterMode = false;
                player.getContainer().style.width = '100%';
                theatreStateHandler();
                uimanager.onTheatreModeToggled.dispatch(uimanager, {isOn: false});
                // uimanager.onT.dispatch(this, { previousUi, currentUi: nextUi });
            } else {
                this.isTheaterMode = true;
                player.getContainer().style.width = '80%';
                theatreStateHandler();
                uimanager.onTheatreModeToggled.dispatch(uimanager, {isOn: true});
            }
        });

        // Startup init
        theatreStateHandler();
    }
}

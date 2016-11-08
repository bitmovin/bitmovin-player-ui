import {ContainerConfig, Container} from "./container";

export interface ControlBarConfig extends ContainerConfig {
    /**
     * Specifies if the control bar should be hidden at startup.
     * Default: true
     */
    hidden?: boolean;

    /**
     * The delay after which the control bar will be hidden when there is no user interaction.
     * Default: 5 seconds
     */
    hideDelay?: number;
}

export class ControlBar extends Container<ControlBarConfig> {

    private static readonly CLASS_HIDDEN = "hidden";

    private _hidden: boolean;

    constructor(config: ControlBarConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            tag: 'div',
            cssClass: 'ui-controlbar',
            hidden: true,
            hideDelay: 5000
        });

        this._hidden = (<ControlBarConfig>this.config).hidden;

        if(this._hidden) {
            this.hide();
        }
    }

    hide() {
        this._hidden = true;
        this.getDomElement().addClass(ControlBar.CLASS_HIDDEN);
    }

    show() {
        this.getDomElement().removeClass(ControlBar.CLASS_HIDDEN);
        this._hidden = false;
    }

    isHidden(): boolean {
        return this._hidden;
    }

    isShown(): boolean {
        return !this.isHidden();
    }

    toggle() {
        if(this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }
}
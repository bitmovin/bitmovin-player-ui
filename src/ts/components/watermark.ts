import {Button, ButtonConfig} from "./button";

export interface WatermarkConfig extends ButtonConfig {
    /**
     * The url to open when the watermark is clicked. Set to null to disable the click handler.
     */
    url?: string;
}

export class Watermark extends Button<WatermarkConfig> {

    constructor(config: WatermarkConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-watermark',
            url: 'http://bitmovin.com'
        }, <WatermarkConfig>this.config);
    }

    initialize(): void {
        super.initialize();

        if (this.getUrl()) {
            let element = this.getDomElement();
            element.data('url', this.getUrl());
            element.on('click', function () {
                window.open(element.data('url'), '_blank');
            });
        }
    }

    getUrl(): string {
        return (<WatermarkConfig>this.config).url;
    }
}
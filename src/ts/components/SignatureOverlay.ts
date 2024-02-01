import {Container, ContainerConfig} from './container';
import {i18n} from '../localization/i18n';
import {DOM} from '../dom';

export interface SignatureOverlayConfig extends ContainerConfig {
    url?: string;
}
export class SignatureOverlay extends Container<SignatureOverlayConfig> {
    private static _instance: SignatureOverlay;
    public img: DOM;
    public static getInstance(): SignatureOverlay {
        if (!SignatureOverlay._instance) {
            SignatureOverlay._instance = new SignatureOverlay();
        }
        return SignatureOverlay._instance;
    }
    private constructor(config: SignatureOverlayConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-signature',
            role: 'link',
            ariaLabel: i18n.getLocalizer('signatureLink'),
        }, <SignatureOverlayConfig>this.config);

    }

    public renderSignature(src: string) {
        this.removeSignature();
        let image = new DOM('img', {
            src: src,
            width: '100%',
            height: '100%',
            id: 'signatureImg',
        });
        this.getDomElement().append(image);
        this.img = image;
        this.show();
    }

    public removeSignature() {
        if (this.img) {
            this.img.remove();
        }
        this.hide();
    }
}

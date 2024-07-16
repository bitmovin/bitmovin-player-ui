import { Component, ComponentConfig } from './component';

class DummyComponent extends Component<ComponentConfig> {
    private static _instance: DummyComponent;

    public static instance(): DummyComponent {
        if (!DummyComponent._instance) {
            DummyComponent._instance = new DummyComponent();
        }

        return DummyComponent._instance;
    }

    public prefixCss(cssClassOrId: string): string {
        return super.prefixCss(cssClassOrId);
    }
}

/**
 * Prefixes any CSS Class or ID with the configured prefix.
 */
export function prefixCss(cssClassOrId: string): string {
    return DummyComponent.instance().prefixCss(cssClassOrId);
}
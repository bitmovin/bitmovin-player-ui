import { Component, ComponentConfig } from './component';

/**
 * A dummy component whose sole purpose is to expose the {@link #prefixCss} method to classes that do not extend {@link Component}.
 */
export class DummyComponent extends Component<ComponentConfig> {
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
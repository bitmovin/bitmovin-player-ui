import * as PlayerUI from '../../src/ts/main';
import { Component } from '../../src/ts/components/Component';

type ComponentFactory = () => Component<any>;

const componentFactories: { [componentName: string]: ComponentFactory } = {
  CastUIContainer: () => new PlayerUI.CastUIContainer({ components: [] }),
  QuickSeekButton: () => new PlayerUI.QuickSeekButton({ cssPrefix: 'ui' }),
  SettingsPanel: () => new PlayerUI.SettingsPanel({ components: [] }),
  UIContainer: () => new PlayerUI.UIContainer({ components: [] }),
};

describe('Component release', () => {
  it.each(getPublicComponentReleaseOverrides())('$componentName can be released before configure', releaseOverride => {
    const component =
      componentFactories[releaseOverride.componentName]?.() ?? new releaseOverride.componentConstructor();

    expect(() => component.release()).not.toThrow();
  });
});

function getPublicComponentReleaseOverrides(): Array<{
  componentName: string;
  componentConstructor: typeof Component;
}> {
  return Object.keys(PlayerUI)
    .map(componentName => ({
      componentName,
      exportValue: (PlayerUI as { [key: string]: unknown })[componentName],
    }))
    .filter((componentExport): componentExport is { componentName: string; exportValue: typeof Component } =>
      isComponentConstructor(componentExport.exportValue),
    )
    .filter(componentExport => Object.prototype.hasOwnProperty.call(componentExport.exportValue.prototype, 'release'))
    .map(({ componentName, exportValue }) => ({ componentName, componentConstructor: exportValue }))
    .sort((left, right) => left.componentName.localeCompare(right.componentName));
}

function isComponentConstructor(exportValue: unknown): boolean {
  return (
    typeof exportValue === 'function' &&
    (exportValue === Component || Component.prototype.isPrototypeOf(exportValue.prototype))
  );
}

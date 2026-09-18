import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as PlayerUI from '../../src/ts/main';
import { Component, ComponentConfig } from '../../src/ts/components/Component';
import { Container, ContainerConfig } from '../../src/ts/components/Container';
import { SettingsPanelItem } from '../../src/ts/components/settings/SettingsPanelItem';
import { UIContainer } from '../../src/ts/components/UIContainer';
import { UIFactory } from '../../src/ts/UIFactory';
import { UIVariantIdentifier } from '../../src/ts/UIManager';
import { BrowserUtils } from '../../src/ts/utils/BrowserUtils';
import { ComponentConfigManager } from '../../src/ts/utils/ComponentConfigManager';
import { getConstructorNames } from '../../src/ts/utils/ConstructorUtils';

const UI_COMPONENT_LAYOUT_OVERRIDES_PATH = path.resolve(__dirname, '../../src/ts/UIComponentLayoutOverrides.ts');

describe('UIComponentLayoutOverrides', () => {
  it('only exposes components addressable in default layouts', () => {
    const componentLayoutOverrideNames = readInterfaceKeys('UIComponentLayoutOverrideMap');
    const addressableComponentNames = getAddressableComponentNames();
    const unsupportedComponentNames = componentLayoutOverrideNames.filter(
      componentName => !addressableComponentNames.has(componentName),
    );

    if (unsupportedComponentNames.length > 0) {
      throw new Error(
        `UIComponentLayoutOverrideMap entries without addressable default layout components: ${unsupportedComponentNames.join(
          ', ',
        )}. Remove them from src/ts/UIComponentLayoutOverrides.ts.`,
      );
    }
  });
});

function getAddressableComponentNames(): Set<string> {
  const publicComponentNames = getPublicComponentNames();
  const addressableComponentNames = new Set<string>();

  for (const layout of buildDefaultLayouts()) {
    collectAddressableComponentNames(layout, publicComponentNames, addressableComponentNames);
  }

  return addressableComponentNames;
}

function buildDefaultLayouts(): UIContainer[] {
  const isMobileSpy = jest.spyOn(BrowserUtils, 'isMobile', 'get');

  try {
    return ComponentConfigManager.run({ Component: { cssPrefix: 'ui' } }, UIVariantIdentifier.main, () => {
      isMobileSpy.mockReturnValue(false);
      const desktopLayouts = [
        UIFactory.defaultLayouts.emptyState(),
        UIFactory.defaultLayouts.subtitle(),
        UIFactory.defaultLayouts.main({ showPersistentPreferencesToggle: true }),
        UIFactory.defaultLayouts.ads(),
        UIFactory.defaultLayouts.smallScreen(),
        UIFactory.defaultLayouts.smallScreenAds(),
        UIFactory.defaultLayouts.castReceiver(),
        UIFactory.defaultLayouts.tv().ui,
        UIFactory.defaultLayouts.tvAds().ui,
      ];

      isMobileSpy.mockReturnValue(true);
      return [...desktopLayouts, UIFactory.defaultLayouts.smallScreen()];
    });
  } finally {
    isMobileSpy.mockRestore();
  }
}

function collectAddressableComponentNames(
  container: Container<ContainerConfig>,
  publicComponentNames: Set<string>,
  addressableComponentNames: Set<string>,
): void {
  for (const component of container.getComponents()) {
    addPublicConstructorNames(component, publicComponentNames, addressableComponentNames);

    if (component instanceof SettingsPanelItem) {
      const settingComponent = component.getConfig().settingComponent;
      if (settingComponent != null) {
        addPublicConstructorNames(settingComponent, publicComponentNames, addressableComponentNames);
      }
    }

    if (component instanceof Container) {
      collectAddressableComponentNames(component, publicComponentNames, addressableComponentNames);
    }
  }
}

function addPublicConstructorNames(
  component: Component<ComponentConfig>,
  publicComponentNames: Set<string>,
  addressableComponentNames: Set<string>,
): void {
  for (const constructorName of getConstructorNames(component.constructor as { prototype: object })) {
    if (publicComponentNames.has(constructorName)) {
      addressableComponentNames.add(constructorName);
    }
  }
}

function getPublicComponentNames(): Set<string> {
  return new Set(
    Object.keys(PlayerUI).filter(exportName =>
      isComponentConstructor((PlayerUI as { [key: string]: unknown })[exportName]),
    ),
  );
}

function readInterfaceKeys(interfaceName: string): string[] {
  const source = ts.createSourceFile(
    UI_COMPONENT_LAYOUT_OVERRIDES_PATH,
    fs.readFileSync(UI_COMPONENT_LAYOUT_OVERRIDES_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const declaration = source.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName,
  );

  if (!declaration) {
    throw new Error(`Could not find ${interfaceName} in src/ts/UIComponentLayoutOverrides.ts.`);
  }

  return declaration.members
    .map(member => member.name)
    .filter(
      (name): name is ts.Identifier | ts.StringLiteral =>
        name != null && (ts.isIdentifier(name) || ts.isStringLiteral(name)),
    )
    .map(name => name.text)
    .sort();
}

function isComponentConstructor(exportValue: unknown): exportValue is typeof Component {
  return (
    typeof exportValue === 'function' &&
    (exportValue === Component || Component.prototype.isPrototypeOf(exportValue.prototype))
  );
}

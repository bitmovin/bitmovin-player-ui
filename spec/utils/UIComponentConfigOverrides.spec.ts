import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { FullscreenToggleButton } from '../../src/ts/components/buttons/FullscreenToggleButton';
import { PlaybackToggleButton } from '../../src/ts/components/buttons/PlaybackToggleButton';
import { VolumeControlButton } from '../../src/ts/components/buttons/VolumeControlButton';
import { Component } from '../../src/ts/components/Component';
import * as PlayerUI from '../../src/ts/main';
import { UIVariantIdentifier } from '../../src/ts/UIManager';
import { ComponentConfigManager } from '../../src/ts/utils/ComponentConfigManager';

const UI_COMPONENT_CONFIG_OVERRIDES_PATH = path.resolve(__dirname, '../../src/ts/UIComponentConfigOverrides.ts');

describe('UIComponentConfigOverrides', () => {
  it('contains every public component export', () => {
    const componentConfigNames = readInterfaceKeys('UIComponentConfigMap');
    const publicComponentNames = getPublicComponentExports().map(({ exportName }) => exportName);

    const missingConfigNames = publicComponentNames.filter(
      componentName => !componentConfigNames.includes(componentName),
    );

    if (missingConfigNames.length > 0) {
      throw new Error(
        `Missing UIComponentConfigMap entries for public component exports: ${missingConfigNames.join(', ')}. ` +
          'Add them to src/ts/UIComponentConfigOverrides.ts.',
      );
    }
  });

  it('only contains public component exports', () => {
    const componentConfigNames = readInterfaceKeys('UIComponentConfigMap');
    const publicComponentNames = getPublicComponentExports().map(({ exportName }) => exportName);

    const unknownConfigNames = componentConfigNames.filter(
      componentName => !publicComponentNames.includes(componentName),
    );

    if (unknownConfigNames.length > 0) {
      throw new Error(
        `UIComponentConfigMap entries without public component exports: ${unknownConfigNames.join(', ')}. ` +
          'Remove them from src/ts/UIComponentConfigOverrides.ts.',
      );
    }
  });

  it('contains every UI variant identifier', () => {
    const uiComponentConfigOverrideNames = readInterfaceKeys('UIComponentConfigOverrides');
    const variantIdentifiers = Object.keys(UIVariantIdentifier).map(
      variantName => UIVariantIdentifier[variantName as keyof typeof UIVariantIdentifier],
    );
    const missingVariantIdentifiers = variantIdentifiers.filter(
      variantIdentifier => !uiComponentConfigOverrideNames.includes(variantIdentifier),
    );

    if (missingVariantIdentifiers.length > 0) {
      throw new Error(
        `Missing UIComponentConfigOverrides entries for UI variant identifiers: ${missingVariantIdentifiers.join(
          ', ',
        )}. ` + 'Add them to src/ts/UIComponentConfigOverrides.ts.',
      );
    }
  });

  it('uses component class names as public component export names', () => {
    const aliasedComponentExports = getPublicComponentExports().filter(
      ({ exportName, componentConstructor }) => exportName !== componentConstructor.name,
    );

    if (aliasedComponentExports.length > 0) {
      throw new Error(
        aliasedComponentExports
          .map(
            ({ exportName, componentConstructor }) =>
              `Public component export "${exportName}" must match its class name "${componentConstructor.name}".`,
          )
          .join('\n'),
      );
    }
  });

  it('applies component config precedence after constructor completion', () => {
    const { playbackToggleButton, fullscreenToggleButton } = ComponentConfigManager.run(
      {
        Button: {
          cssClass: 'global-button',
          hidden: false,
        },
        ToggleButton: {
          cssClass: 'global-toggle-button',
          offClass: 'global-off',
        },
        PlaybackToggleButton: {
          cssClass: 'global-playback-toggle-button',
          text: 'global playback',
        },
        FullscreenToggleButton: {
          cssClass: 'global-fullscreen-toggle-button',
          text: 'global fullscreen',
        },
        main: {
          Button: {
            cssClass: 'main-button',
            hidden: true,
          },
          ToggleButton: {
            cssClass: 'main-toggle-button',
            offClass: 'main-off',
          },
          PlaybackToggleButton: {
            cssClass: 'main-playback-toggle-button',
            text: 'main playback',
          },
          FullscreenToggleButton: {
            cssClass: 'main-fullscreen-toggle-button',
            text: 'main fullscreen',
          },
        },
      },
      UIVariantIdentifier.main,
      () => ({
        playbackToggleButton: new PlaybackToggleButton({
          cssClass: 'constructor-playback-toggle-button',
          offClass: 'constructor-off',
          text: 'constructor playback',
          hidden: false,
        }),
        fullscreenToggleButton: new FullscreenToggleButton({
          cssClass: 'constructor-fullscreen-toggle-button',
          offClass: 'constructor-fullscreen-off',
          text: 'constructor fullscreen',
          hidden: false,
        }),
      }),
    );

    expect(playbackToggleButton.getConfig()).toMatchObject({
      cssClass: 'main-playback-toggle-button',
      hidden: true,
      offClass: 'main-off',
      text: 'main playback',
    });
    expect(fullscreenToggleButton.getConfig()).toMatchObject({
      cssClass: 'main-fullscreen-toggle-button',
      hidden: true,
      offClass: 'main-off',
      text: 'main fullscreen',
    });
  });

  it('makes component config available to subclass constructors after super', () => {
    const volumeControlButton = ComponentConfigManager.run(
      {
        main: {
          VolumeControlButton: {
            vertical: false,
          },
        },
      },
      UIVariantIdentifier.main,
      () => new VolumeControlButton(),
    );

    expect(volumeControlButton.getVolumeSlider().getConfig()).toMatchObject({
      vertical: false,
      hidden: true,
    });
  });
});

function getPublicComponentExports(): Array<{ exportName: string; componentConstructor: typeof Component }> {
  return Object.keys(PlayerUI)
    .map(exportName => ({
      exportName,
      exportValue: (PlayerUI as { [key: string]: unknown })[exportName],
    }))
    .filter((componentExport): componentExport is { exportName: string; exportValue: typeof Component } =>
      isComponentConstructor(componentExport.exportValue),
    )
    .map(({ exportName, exportValue }) => ({ exportName, componentConstructor: exportValue }))
    .sort((left, right) => left.exportName.localeCompare(right.exportName));
}

function readInterfaceKeys(interfaceName: string): string[] {
  const uiComponentConfigOverridesSource = ts.createSourceFile(
    UI_COMPONENT_CONFIG_OVERRIDES_PATH,
    fs.readFileSync(UI_COMPONENT_CONFIG_OVERRIDES_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const componentConfigOverrides = uiComponentConfigOverridesSource.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName,
  );

  if (!componentConfigOverrides) {
    throw new Error(`Could not find ${interfaceName} in src/ts/UIComponentConfigOverrides.ts.`);
  }

  return componentConfigOverrides.members
    .map(member => member.name)
    .map(readPropertyName)
    .filter((name): name is string => !!name)
    .sort();
}

function readPropertyName(name: ts.PropertyName | undefined): string | undefined {
  if (!name) {
    return undefined;
  }

  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }

  if (ts.isComputedPropertyName(name) && ts.isPropertyAccessExpression(name.expression)) {
    // Variant keys are written as [UIVariantIdentifier.main] so the public docs stay tied to the enum.
    const enumKey = name.expression.name.text as keyof typeof UIVariantIdentifier;
    return UIVariantIdentifier[enumKey];
  }

  return undefined;
}

function isComponentConstructor(exportValue: unknown): boolean {
  return (
    typeof exportValue === 'function' &&
    (exportValue === Component || Component.prototype.isPrototypeOf(exportValue.prototype))
  );
}

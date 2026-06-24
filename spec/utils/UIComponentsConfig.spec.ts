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

const UI_COMPONENTS_CONFIG_PATH = path.resolve(__dirname, '../../src/ts/UIComponentsConfig.ts');

describe('UIComponentsConfig', () => {
  it('contains every public component export', () => {
    const componentConfigNames = readInterfaceKeys('UIComponentConfigMap');
    const publicComponentNames = getPublicComponentExports().map(({ exportName }) => exportName);

    const missingConfigNames = publicComponentNames.filter(
      componentName => !componentConfigNames.includes(componentName),
    );

    if (missingConfigNames.length > 0) {
      throw new Error(
        `Missing UIComponentConfigMap entries for public component exports: ${missingConfigNames.join(', ')}. ` +
          'Add them to src/ts/UIComponentsConfig.ts.',
      );
    }
  });

  it('contains every UI variant identifier', () => {
    const uiComponentsConfigNames = readInterfaceKeys('UIComponentsConfig');
    const variantIdentifiers = Object.keys(UIVariantIdentifier).map(
      variantName => UIVariantIdentifier[variantName as keyof typeof UIVariantIdentifier],
    );
    const missingVariantIdentifiers = variantIdentifiers.filter(
      variantIdentifier => !uiComponentsConfigNames.includes(variantIdentifier),
    );

    if (missingVariantIdentifiers.length > 0) {
      throw new Error(
        `Missing UIComponentsConfig entries for UI variant identifiers: ${missingVariantIdentifiers.join(', ')}. ` +
          'Add them to src/ts/UIComponentsConfig.ts.',
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
      exportValue: (PlayerUI as { [exportName: string]: unknown })[exportName],
    }))
    .filter((componentExport): componentExport is { exportName: string; exportValue: typeof Component } =>
      isComponentConstructor(componentExport.exportValue),
    )
    .map(({ exportName, exportValue }) => ({ exportName, componentConstructor: exportValue }))
    .sort((left, right) => left.exportName.localeCompare(right.exportName));
}

function readInterfaceKeys(interfaceName: string): string[] {
  const uiComponentsConfigSource = ts.createSourceFile(
    UI_COMPONENTS_CONFIG_PATH,
    fs.readFileSync(UI_COMPONENTS_CONFIG_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const componentsConfig = uiComponentsConfigSource.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName,
  );

  if (!componentsConfig) {
    throw new Error(`Could not find ${interfaceName} in src/ts/UIComponentsConfig.ts.`);
  }

  return componentsConfig.members
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

// Kept separate from CaptionToggleButton.spec.ts because building the real default layouts requires
// the actual DOM implementation, while that spec mocks the DOM module through MockHelper.
import * as fs from 'fs';
import * as path from 'path';
import { CaptionToggleButton } from '../../../src/ts/components/buttons/CaptionToggleButton';
import { Container, ContainerConfig } from '../../../src/ts/components/Container';
import { UIComponentLayoutOverride } from '../../../src/ts/UIComponentLayoutOverrides';
import { UIConfig } from '../../../src/ts/UIConfig';
import { UIFactory } from '../../../src/ts/UIFactory';
import { UIVariantIdentifier } from '../../../src/ts/UIManager';
import { ComponentConfigManager } from '../../../src/ts/utils/ComponentConfigManager';
import { ComponentLayoutOverrideProcessor } from '../../../src/ts/utils/ComponentLayoutOverrideProcessor';
import { UIUtils } from '../../../src/ts/utils/UIUtils';

const LAYOUT_VARIANTS = [UIVariantIdentifier.main, UIVariantIdentifier.smallScreen];

function withLayout<T>(
  uiVariantIdentifier: UIVariantIdentifier,
  use: (uiContainer: Container<ContainerConfig>) => T,
): T {
  return ComponentConfigManager.run({ Component: { cssPrefix: 'ui' } }, uiVariantIdentifier, () =>
    use(
      uiVariantIdentifier === UIVariantIdentifier.smallScreen
        ? UIFactory.defaultLayouts.smallScreen()
        : UIFactory.defaultLayouts.main(),
    ),
  );
}

/**
 * Reads the default `componentLayoutOverrides` the UIManager merges into every config. The UIManager
 * constructor cannot be run here without a full player, so the defaults are read from its source
 * instead of being restated in this spec.
 */
function getDefaultComponentLayoutOverrides(): Record<string, UIComponentLayoutOverride> {
  const uiManagerSource = fs.readFileSync(path.resolve(__dirname, '../../../src/ts/UIManager.ts'), 'utf8');
  const defaultsBlock = /componentLayoutOverrides: \{\n([\s\S]*?)\n\s*\.\.\.\(/.exec(uiManagerSource);

  if (!defaultsBlock) {
    throw new Error('Could not read the default componentLayoutOverrides from src/ts/UIManager.ts.');
  }

  const overrides: Record<string, UIComponentLayoutOverride> = {};
  const overridePattern = /(\w+): UIComponentLayoutOverride\.(\w+)/g;
  let match = overridePattern.exec(defaultsBlock[1]);

  while (match) {
    overrides[match[1]] = UIComponentLayoutOverride[match[2] as keyof typeof UIComponentLayoutOverride];
    match = overridePattern.exec(defaultsBlock[1]);
  }

  return overrides;
}

function countCaptionToggleButtons(container: Container<ContainerConfig>): number {
  let captionToggleButtonCount = 0;
  UIUtils.traverseTree(container, component => {
    if (component instanceof CaptionToggleButton) {
      captionToggleButtonCount++;
    }
  });

  return captionToggleButtonCount;
}

describe('CaptionToggleButton in the default layouts', () => {
  it.each(LAYOUT_VARIANTS)('is part of the %s layout', uiVariantIdentifier => {
    expect(withLayout(uiVariantIdentifier, countCaptionToggleButtons)).toBe(1);
  });

  it('is excluded by the default component layout overrides', () => {
    // The UIManager merges these defaults into every config, so the button ships opted out and
    // integrators have to include it explicitly.
    expect(getDefaultComponentLayoutOverrides().CaptionToggleButton).toBe(UIComponentLayoutOverride.Exclude);
  });

  it.each(LAYOUT_VARIANTS)('is removed from the %s layout when excluded', uiVariantIdentifier => {
    const uiConfig: UIConfig = {
      componentLayoutOverrides: {
        CaptionToggleButton: UIComponentLayoutOverride.Exclude,
      },
    };

    const remainingButtons = withLayout(uiVariantIdentifier, uiContainer => {
      new ComponentLayoutOverrideProcessor(uiConfig).process(uiContainer, uiVariantIdentifier);
      return countCaptionToggleButtons(uiContainer);
    });

    expect(remainingButtons).toBe(0);
  });

  it.each(LAYOUT_VARIANTS)('is kept in the %s layout when included', uiVariantIdentifier => {
    const uiConfig: UIConfig = {
      componentLayoutOverrides: {
        CaptionToggleButton: UIComponentLayoutOverride.Include,
      },
    };

    const remainingButtons = withLayout(uiVariantIdentifier, uiContainer => {
      new ComponentLayoutOverrideProcessor(uiConfig).process(uiContainer, uiVariantIdentifier);
      return countCaptionToggleButtons(uiContainer);
    });

    expect(remainingButtons).toBe(1);
  });
});

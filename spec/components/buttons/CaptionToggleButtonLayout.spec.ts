// Kept separate from CaptionToggleButton.spec.ts because building the real default layouts requires
// the actual DOM implementation, while that spec mocks the DOM module through MockHelper.
import { CaptionToggleButton } from '../../../src/ts/components/buttons/CaptionToggleButton';
import { Container, ContainerConfig } from '../../../src/ts/components/Container';
import { UIComponentLayoutOverride } from '../../../src/ts/UIComponentLayoutOverrides';
import { UIConfig } from '../../../src/ts/UIConfig';
import { UIFactory } from '../../../src/ts/UIFactory';
import { UIVariantIdentifier } from '../../../src/ts/UIManager';
import { ComponentConfigManager } from '../../../src/ts/utils/ComponentConfigManager';
import {
  ComponentLayoutOverrideProcessor,
  mergeComponentLayoutOverrides,
} from '../../../src/ts/utils/ComponentLayoutOverrideProcessor';
import { UIUtils } from '../../../src/ts/utils/UIUtils';

// Layouts that render subtitles and own a control bar the button can live in. The ad layouts have no
// SubtitleOverlay, and emptyState/castReceiver/subtitle have no control bar to put the button in.
const LAYOUT_VARIANTS = [UIVariantIdentifier.main, UIVariantIdentifier.smallScreen, UIVariantIdentifier.tv];

const LAYOUT_BUILDERS: { [key: string]: () => Container<ContainerConfig> } = {
  [UIVariantIdentifier.main]: () => UIFactory.defaultLayouts.main(),
  [UIVariantIdentifier.smallScreen]: () => UIFactory.defaultLayouts.smallScreen(),
  [UIVariantIdentifier.tv]: () => UIFactory.defaultLayouts.tv().ui,
};

function withLayout<T>(
  uiVariantIdentifier: UIVariantIdentifier,
  use: (uiContainer: Container<ContainerConfig>) => T,
): T {
  return ComponentConfigManager.run({ Component: { cssPrefix: 'ui' } }, uiVariantIdentifier, () =>
    use(LAYOUT_BUILDERS[uiVariantIdentifier]()),
  );
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
    expect(mergeComponentLayoutOverrides({}).CaptionToggleButton).toBe(UIComponentLayoutOverride.Exclude);
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

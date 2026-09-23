import { FullscreenToggleButton } from '../../src/ts/components/buttons/FullscreenToggleButton';
import { PlaybackToggleButton } from '../../src/ts/components/buttons/PlaybackToggleButton';
import { Container, ContainerConfig } from '../../src/ts/components/Container';
import { PlaybackSpeedSelectBox } from '../../src/ts/components/settings/PlaybackSpeedSelectBox';
import { SettingsPanelItem } from '../../src/ts/components/settings/SettingsPanelItem';
import { UIComponentLayoutOverride } from '../../src/ts/UIComponentLayoutOverrides';
import { UIVariantIdentifier } from '../../src/ts/UIManager';
import { ComponentLayoutOverrideProcessor } from '../../src/ts/utils/ComponentLayoutOverrideProcessor';

describe('ComponentLayoutOverrideProcessor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the resolved component tree unchanged without layout override config', () => {
    const fullscreenToggleButton = new FullscreenToggleButton();
    const uiContainer = new Container<ContainerConfig>({ components: [fullscreenToggleButton] });
    const releaseSpy = jest.spyOn(fullscreenToggleButton, 'release');

    new ComponentLayoutOverrideProcessor({}).process(uiContainer, UIVariantIdentifier.main);

    expect(uiContainer.getComponents()).toEqual([fullscreenToggleButton]);
    expect(releaseSpy).not.toHaveBeenCalled();
  });

  it('removes top-level excluded components and releases them', () => {
    const playbackToggleButton = new PlaybackToggleButton();
    const fullscreenToggleButton = new FullscreenToggleButton();
    const uiContainer = new Container<ContainerConfig>({
      components: [playbackToggleButton, fullscreenToggleButton],
    });
    const playbackToggleButtonReleaseSpy = jest.spyOn(playbackToggleButton, 'release');
    const fullscreenToggleButtonReleaseSpy = jest.spyOn(fullscreenToggleButton, 'release');

    new ComponentLayoutOverrideProcessor({
      componentLayoutOverrides: {
        FullscreenToggleButton: UIComponentLayoutOverride.Exclude,
      },
    }).process(uiContainer, UIVariantIdentifier.main);

    expect(uiContainer.getComponents()).toEqual([playbackToggleButton]);
    expect(playbackToggleButtonReleaseSpy).not.toHaveBeenCalled();
    expect(fullscreenToggleButtonReleaseSpy).toHaveBeenCalledTimes(1);
  });

  it('lets variant-scoped overrides win over top-level base component overrides', () => {
    const playbackToggleButton = new PlaybackToggleButton();
    const fullscreenToggleButton = new FullscreenToggleButton();
    const uiContainer = new Container<ContainerConfig>({
      components: [playbackToggleButton, fullscreenToggleButton],
    });

    new ComponentLayoutOverrideProcessor({
      componentLayoutOverrides: {
        Button: UIComponentLayoutOverride.Exclude,
        main: {
          FullscreenToggleButton: UIComponentLayoutOverride.Include,
        },
      },
    }).process(uiContainer, UIVariantIdentifier.main);

    expect(uiContainer.getComponents()).toEqual([fullscreenToggleButton]);
  });

  it('removes a settings row that owns an excluded setting component', () => {
    const playbackSpeedSelectBox = new PlaybackSpeedSelectBox();
    const settingsPanelItem = new SettingsPanelItem({ settingComponent: playbackSpeedSelectBox });
    const fullscreenToggleButton = new FullscreenToggleButton();
    const uiContainer = new Container<ContainerConfig>({
      components: [settingsPanelItem, fullscreenToggleButton],
    });
    const settingsPanelItemReleaseSpy = jest.spyOn(settingsPanelItem, 'release');
    const playbackSpeedSelectBoxReleaseSpy = jest.spyOn(playbackSpeedSelectBox, 'release');

    new ComponentLayoutOverrideProcessor({
      componentLayoutOverrides: {
        PlaybackSpeedSelectBox: UIComponentLayoutOverride.Exclude,
      },
    }).process(uiContainer, UIVariantIdentifier.main);

    expect(uiContainer.getComponents()).toEqual([fullscreenToggleButton]);
    expect(settingsPanelItemReleaseSpy).toHaveBeenCalledTimes(1);
    expect(playbackSpeedSelectBoxReleaseSpy).toHaveBeenCalledTimes(1);
  });

  it('applies overrides when a minifier mangled the runtime class names', async () => {
    await jest.isolateModulesAsync(async () => {
      const { FullscreenToggleButton } = await import('../../src/ts/components/buttons/FullscreenToggleButton');
      const { PlaybackToggleButton } = await import('../../src/ts/components/buttons/PlaybackToggleButton');
      const { Container } = await import('../../src/ts/components/Container');
      const { UIComponentLayoutOverride } = await import('../../src/ts/UIComponentLayoutOverrides');
      const { UIVariantIdentifier } = await import('../../src/ts/UIManager');
      const { ComponentLayoutOverrideProcessor } = await import('../../src/ts/utils/ComponentLayoutOverrideProcessor');
      const playbackToggleButton = new PlaybackToggleButton();
      const fullscreenToggleButton = new FullscreenToggleButton();
      const uiContainer = new Container({
        components: [playbackToggleButton, fullscreenToggleButton],
      });
      const originalNameDescriptor = Object.getOwnPropertyDescriptor(FullscreenToggleButton, 'name');
      Object.defineProperty(FullscreenToggleButton, 'name', { value: 'r', configurable: true });

      try {
        new ComponentLayoutOverrideProcessor({
          componentLayoutOverrides: {
            FullscreenToggleButton: UIComponentLayoutOverride.Exclude,
          },
        }).process(uiContainer, UIVariantIdentifier.main);
      } finally {
        Object.defineProperty(FullscreenToggleButton, 'name', originalNameDescriptor);
      }

      expect(uiContainer.getComponents()).toEqual([playbackToggleButton]);
    });
  });

  it('recursively releases removed component subtrees', () => {
    const fullscreenToggleButton = new FullscreenToggleButton();
    const nestedContainer = new Container<ContainerConfig>({ components: [fullscreenToggleButton] });
    const uiContainer = new Container<ContainerConfig>({ components: [nestedContainer] });
    const nestedContainerReleaseSpy = jest.spyOn(nestedContainer, 'release');
    const fullscreenToggleButtonReleaseSpy = jest.spyOn(fullscreenToggleButton, 'release');

    new ComponentLayoutOverrideProcessor({
      componentLayoutOverrides: {
        Container: UIComponentLayoutOverride.Exclude,
      },
    }).process(uiContainer, UIVariantIdentifier.main);

    expect(uiContainer.getComponents()).toEqual([]);
    expect(nestedContainerReleaseSpy).toHaveBeenCalledTimes(1);
    expect(fullscreenToggleButtonReleaseSpy).toHaveBeenCalledTimes(1);
  });
});

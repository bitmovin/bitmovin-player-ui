import { Component, ComponentConfig } from '../src/ts/components/Component';
import { Container, ContainerConfig } from '../src/ts/components/Container';
import { PlayerGraphsContextMenuItem } from '../src/ts/components/panels/player-graphs/PlayerGraphsContextMenuItem';
import { PlayerGraphsPanel } from '../src/ts/components/panels/player-graphs/PlayerGraphsPanel';
import { UIComponentLayoutOverride } from '../src/ts/UIComponentLayoutOverrides';
import { UIConfig } from '../src/ts/UIConfig';
import { UIFactory } from '../src/ts/UIFactory';
import { UIVariantIdentifier } from '../src/ts/UIManager';
import { ComponentConfigManager } from '../src/ts/utils/ComponentConfigManager';

const { Include, Exclude } = UIComponentLayoutOverride;

function countPlayerGraphsComponents(container: Container<ContainerConfig>): number {
  return container
    .getComponents()
    .reduce(
      (count: number, component: Component<ComponentConfig>) =>
        count +
        (component instanceof PlayerGraphsPanel || component instanceof PlayerGraphsContextMenuItem ? 1 : 0) +
        (component instanceof Container ? countPlayerGraphsComponents(component) : 0),
      0,
    );
}

// A variant without an identifier gets no layout overrides from `UIManager`, so the layout itself must read the config.
describe.each([
  ['main', UIVariantIdentifier.main, (config: UIConfig) => UIFactory.defaultLayouts.main(config)],
  ['smallScreen', UIVariantIdentifier.smallScreen, (config: UIConfig) => UIFactory.defaultLayouts.smallScreen(config)],
])('UIFactory %s layout', (_name, variant, buildLayout) => {
  function countIn(config: UIConfig): number {
    return countPlayerGraphsComponents(
      ComponentConfigManager.run({ Component: { cssPrefix: 'ui' } }, variant, () => buildLayout(config)),
    );
  }

  it.each([
    ['playerGraphs unset', {}],
    ['playerGraphs false', { playerGraphs: false }],
    [
      'playerGraphs true and the panel excluded',
      { playerGraphs: true, componentLayoutOverrides: { PlayerGraphsPanel: Exclude } },
    ],
    [
      'the panel included and excluded for this variant',
      { componentLayoutOverrides: { PlayerGraphsPanel: Include, [variant]: { PlayerGraphsPanel: Exclude } } },
    ],
  ])('builds no player graphs panel and no menu entry with %s', (_case, config: UIConfig) => {
    expect(countIn(config)).toBe(0);
  });

  it.each([
    ['playerGraphs true', { playerGraphs: true }],
    ['the panel included', { componentLayoutOverrides: { PlayerGraphsPanel: Include } }],
    [
      'the panel included for this variant',
      { componentLayoutOverrides: { [variant]: { PlayerGraphsPanel: Include } } },
    ],
    [
      'the panel excluded and included for this variant',
      { componentLayoutOverrides: { PlayerGraphsPanel: Exclude, [variant]: { PlayerGraphsPanel: Include } } },
    ],
  ])('builds the player graphs panel and its menu entry with %s', (_case, config: UIConfig) => {
    expect(countIn(config)).toBe(2);
  });
});

import { Component, ComponentConfig } from '../src/ts/components/Component';
import { Container, ContainerConfig } from '../src/ts/components/Container';
import { SubtitleOverlay } from '../src/ts/components/overlays/SubtitleOverlay';
import { UIFactory } from '../src/ts/UIFactory';
import { UIVariantIdentifier } from '../src/ts/UIManager';
import { ComponentConfigManager } from '../src/ts/utils/ComponentConfigManager';

function buildLayout<T>(build: () => T): T {
  return ComponentConfigManager.run({ Component: { cssPrefix: 'ui' } }, UIVariantIdentifier.ads, build);
}

function containsSubtitleOverlay(container: Container<ContainerConfig>): boolean {
  return container
    .getComponents()
    .some(
      (component: Component<ComponentConfig>) =>
        component instanceof SubtitleOverlay || (component instanceof Container && containsSubtitleOverlay(component)),
    );
}

describe('UIFactory ad layouts', () => {
  // Linear ads swap in the ad layout, so without an overlay here cues of an ad subtitle track have nowhere to render.
  it.each([
    ['ads', () => UIFactory.defaultLayouts.ads()],
    ['smallScreenAds', () => UIFactory.defaultLayouts.smallScreenAds()],
    ['tvAds', () => UIFactory.defaultLayouts.tvAds().ui],
  ])('%s layout includes a SubtitleOverlay', (_name, build) => {
    expect(containsSubtitleOverlay(buildLayout(build))).toBe(true);
  });
});

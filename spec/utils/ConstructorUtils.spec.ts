import { Component } from '../../src/ts/components/Component';
import { Watermark } from '../../src/ts/components/Watermark';
import { getConstructorNames } from '../../src/ts/utils/ConstructorUtils';

describe('getConstructorNames', () => {
  it('returns the names of all classes in the prototype chain, base classes first', () => {
    const constructorNames = getConstructorNames(Watermark);

    const componentIndex = constructorNames.indexOf('Component');
    const clickOverlayIndex = constructorNames.indexOf('ClickOverlay');
    const watermarkIndex = constructorNames.indexOf('Watermark');
    expect(componentIndex).toBeGreaterThanOrEqual(0);
    expect(clickOverlayIndex).toBeGreaterThan(componentIndex);
    expect(watermarkIndex).toBeGreaterThan(clickOverlayIndex);
  });

  it('returns public class names when a minifier mangled the runtime class names', async () => {
    await jest.isolateModulesAsync(async () => {
      const { Component } = await import('../../src/ts/components/Component');
      const { Watermark } = await import('../../src/ts/components/Watermark');
      const { getConstructorNames } = await import('../../src/ts/utils/ConstructorUtils');
      const restoreClassNames = mangleClassNames([Watermark, Component]);

      try {
        const constructorNames = getConstructorNames(Watermark);

        expect(constructorNames).not.toContain('r');
        expect(constructorNames).not.toContain('t');
        expect(constructorNames).toContain('Component');
        expect(constructorNames).toContain('ClickOverlay');
        expect(constructorNames).toContain('Watermark');
      } finally {
        restoreClassNames();
      }
    });
  });

  it('falls back to the runtime class name for non-public classes', () => {
    class CustomWatermark extends Watermark {}

    const constructorNames = getConstructorNames(CustomWatermark);

    expect(constructorNames).toContain('Watermark');
    expect(constructorNames[constructorNames.length - 1]).toEqual('CustomWatermark');
  });
});

/** Simulates minifier identifier mangling, which renames classes but leaves export names untouched. */
function mangleClassNames(constructors: object[]): () => void {
  const mangledNames = ['r', 't', 'n', 'e', 'i'];
  const originalDescriptors = constructors.map(constructor => Object.getOwnPropertyDescriptor(constructor, 'name'));

  constructors.forEach((constructor, index) => {
    Object.defineProperty(constructor, 'name', { value: mangledNames[index], configurable: true });
  });

  return () => {
    constructors.forEach((constructor, index) => {
      Object.defineProperty(constructor, 'name', originalDescriptors[index]);
    });
  };
}

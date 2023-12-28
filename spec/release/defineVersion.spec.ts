const { defineReleaseVersion } = require('../../.github/scripts/defineVersion');

describe('defineReleaseVersion', () => {
  test.each`
    existingVersion   | desiredReleaseLevel | expectedVersion
    ${'1.0.0'}        | ${'major'}          | ${'2.0.0'}
    ${'1.0.0'}        | ${'minor'}          | ${'1.1.0'}
    ${'1.1.0'}        | ${'minor'}          | ${'1.2.0'}
    ${'1.0.0'}        | ${'patch'}          | ${'1.0.1'}
    ${'1.1.0'}        | ${'patch'}          | ${'1.1.1'}
    ${'1.0.4'}        | ${'patch'}          | ${'1.0.5'}
    ${'1.0.0'}        | ${'minor'}          | ${'1.1.0'}
    ${'1.0.0'}        | ${'minor'}          | ${'1.1.0'}
    ${'1.0.0'}        | ${'major'}          | ${'2.0.0'}
    ${'1.5.0'}        | ${'major'}          | ${'2.0.0'}
    ${'2.0.0'}        | ${'major'}          | ${'3.0.0'}
  `(
    'should return version $expectedVersion with version $existingVersion and $desiredReleaseLevel release level',
    ({ existingVersion, desiredReleaseLevel, expectedVersion }) => {
      const core = { info() {} };
      const result = defineReleaseVersion({ core }, desiredReleaseLevel, existingVersion);

      expect(result.full).toEqual(expectedVersion);
    },
  );
});

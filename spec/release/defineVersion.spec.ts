const { defineReleaseVersion } = require('../../.github/scripts/defineVersion');

describe('defineReleaseVersion', () => {
  test.each`
    existingVersion   | desiredReleaseLevel | preReleaseTag | expectedVersion
    ${'1.0.0'}        | ${'major'}          | ${undefined}  | ${'2.0.0'}
    ${'1.0.0'}        | ${'minor'}          | ${undefined}  | ${'1.1.0'}
    ${'1.1.0'}        | ${'minor'}          | ${undefined}  | ${'1.2.0'}
    ${'1.0.0'}        | ${'patch'}          | ${undefined}  | ${'1.0.1'}
    ${'1.1.0'}        | ${'patch'}          | ${undefined}  | ${'1.1.1'}
    ${'1.0.4'}        | ${'patch'}          | ${undefined}  | ${'1.0.5'}
    ${'1.0.0'}        | ${'minor'}          | ${'rc'}       | ${'1.1.0-rc.0'}
    ${'1.1.0-rc.0'}   | ${'minor'}          | ${undefined}  | ${'1.1.0'}
    ${'1.0.0'}        | ${'minor'}          | ${'beta'}     | ${'1.1.0-beta.0'}
    ${'1.1.0-beta.0'} | ${'minor'}          | ${'beta'}     | ${'1.1.0-beta.1'}
    ${'1.1.0-beta.5'} | ${'minor'}          | ${'beta'}     | ${'1.1.0-beta.6'}
    ${'1.0.0'}        | ${'major'}          | ${'beta'}     | ${'2.0.0-beta.0'}
    ${'1.5.0'}        | ${'major'}          | ${'beta'}     | ${'2.0.0-beta.0'}
    ${'1.5.0'}        | ${'major'}          | ${'rc'}       | ${'2.0.0-rc.0'}
    ${'2.0.0-beta.0'} | ${'major'}          | ${'rc'}       | ${'2.0.0-rc.0'}
    ${'2.0.0-rc.1'}   | ${'major'}          | ${undefined}  | ${'2.0.0'}
  `(
    'should return version $expectedVersion with version $existingVersion and $desiredReleaseLevel release level',
    ({ existingVersion, desiredReleaseLevel, preReleaseTag, expectedVersion }) => {
      const core = { info() {} };
      const result = defineReleaseVersion({ core }, desiredReleaseLevel, preReleaseTag, existingVersion);

      expect(result.full).toEqual(expectedVersion);
    },
  );
});

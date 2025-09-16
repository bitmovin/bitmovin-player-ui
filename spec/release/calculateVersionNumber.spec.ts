// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calculateVersionNumber } = require('../../.github/scripts/calculateVersionNumber');

describe('calculateVersionNumber', () => {
  const mockCore = {
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('final releases', () => {
    test.each`
      inputVersion  | expectedVersion
      ${'1.0.0'}    | ${'1.0.0'}
      ${'2.5.3'}    | ${'2.5.3'}
      ${'10.15.20'} | ${'10.15.20'}
    `(
      'should return $expectedVersion for final release of $inputVersion',
      ({ inputVersion, expectedVersion }) => {
        const result = calculateVersionNumber(mockCore, inputVersion, 'final');

        expect(result.version_number).toBe(expectedVersion);
        expect(result.major_version).toBe(parseInt(expectedVersion.split('.')[0]));
        expect(result.tag_name).toBe(`v${expectedVersion}`);
      },
    );
  });

  describe('pre-release versions - alpha', () => {
    test.each`
      inputVersion | latestTag               | expectedVersion
      ${'1.0.0'}   | ${''}                   | ${'1.0.0-alpha.1'}
      ${'1.0.0'}   | ${'v1.0.0-alpha.1'}     | ${'1.0.0-alpha.2'}
      ${'1.0.0'}   | ${'v1.0.0-alpha.5'}     | ${'1.0.0-alpha.6'}
      ${'2.5.3'}   | ${''}                   | ${'2.5.3-alpha.1'}
      ${'2.5.3'}   | ${'v2.5.3-alpha.10'}    | ${'2.5.3-alpha.11'}
    `(
      'should return $expectedVersion for alpha release of $inputVersion with latest tag $latestTag',
      ({ inputVersion, latestTag, expectedVersion }) => {
        const result = calculateVersionNumber(mockCore, inputVersion, 'alpha', latestTag);

        expect(result.version_number).toBe(expectedVersion);
        expect(result.major_version).toBe(parseInt(expectedVersion.split('.')[0]));
        expect(result.tag_name).toBe(`v${expectedVersion}`);
      },
    );
  });

  describe('pre-release versions - beta', () => {
    test.each`
      inputVersion | latestTag               | expectedVersion
      ${'1.0.0'}   | ${''}                   | ${'1.0.0-beta.1'}
      ${'1.0.0'}   | ${'v1.0.0-beta.1'}      | ${'1.0.0-beta.2'}
      ${'1.0.0'}   | ${'v1.0.0-beta.3'}      | ${'1.0.0-beta.4'}
      ${'3.2.1'}   | ${''}                   | ${'3.2.1-beta.1'}
      ${'3.2.1'}   | ${'v3.2.1-beta.7'}      | ${'3.2.1-beta.8'}
    `(
      'should return $expectedVersion for beta release of $inputVersion with latest tag $latestTag',
      ({ inputVersion, latestTag, expectedVersion }) => {
        const result = calculateVersionNumber(mockCore, inputVersion, 'beta', latestTag);

        expect(result.version_number).toBe(expectedVersion);
        expect(result.major_version).toBe(parseInt(expectedVersion.split('.')[0]));
        expect(result.tag_name).toBe(`v${expectedVersion}`);
      },
    );
  });

  describe('pre-release versions - rc', () => {
    test.each`
      inputVersion | latestTag               | expectedVersion
      ${'1.0.0'}   | ${''}                   | ${'1.0.0-rc.1'}
      ${'1.0.0'}   | ${'v1.0.0-rc.1'}        | ${'1.0.0-rc.2'}
      ${'1.0.0'}   | ${'v1.0.0-rc.15'}       | ${'1.0.0-rc.16'}
      ${'4.1.2'}   | ${''}                   | ${'4.1.2-rc.1'}
      ${'4.1.2'}   | ${'v4.1.2-rc.3'}        | ${'4.1.2-rc.4'}
    `(
      'should return $expectedVersion for rc release of $inputVersion with latest tag $latestTag',
      ({ inputVersion, latestTag, expectedVersion }) => {
        const result = calculateVersionNumber(mockCore, inputVersion, 'rc', latestTag);

        expect(result.version_number).toBe(expectedVersion);
        expect(result.major_version).toBe(parseInt(expectedVersion.split('.')[0]));
        expect(result.tag_name).toBe(`v${expectedVersion}`);
      },
    );
  });
});

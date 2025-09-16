// eslint-disable-next-line @typescript-eslint/no-require-imports
const { detectReleaseLevel } = require('../../.github/scripts/detectReleaseLevel');
const fs = require('fs');

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('detectReleaseLevel', () => {
  const mockCore = {
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('minor releases', () => {
    test.each`
      changelogContent                                                          | expectedLevel | reason
      ${'## [Unreleased]\n\n### Added\n- New feature'}                        | ${'minor'}    | ${'Added section'}
      ${'## [Unreleased]\n\n### Changed\n- Updated something'}                | ${'minor'}    | ${'Changed section'}
      ${'## [Unreleased]\n\n### Removed\n- Removed old feature'}              | ${'minor'}    | ${'Removed section'}
      ${'## [Unreleased]\n\n### Added\n- New\n\n### Fixed\n- Bug fix'}        | ${'minor'}    | ${'Added and Fixed sections'}
      ${'## [Unreleased]\n\n### Changed\n- Update\n\n### Removed\n- Old'}     | ${'minor'}    | ${'Changed and Removed sections'}
      ${'## [UNRELEASED]\n\n### ADDED\n- Feature'}                            | ${'minor'}    | ${'case insensitive matching'}
    `(
      'should return $expectedLevel for changelog with $reason',
      ({ changelogContent, expectedLevel }) => {
        mockedFs.readFileSync.mockReturnValue(changelogContent);

        const result = detectReleaseLevel(mockCore);

        expect(result).toBe(expectedLevel);
        expect(mockCore.info).toHaveBeenCalledWith('Found Added, Changed, or Removed sections - will create minor release');
        expect(mockCore.info).toHaveBeenCalledWith(`Release level: ${expectedLevel}`);
      },
    );
  });

  describe('patch releases', () => {
    test.each`
      changelogContent                                            | expectedLevel | reason
      ${'## [Unreleased]\n\n### Fixed\n- Bug fix'}              | ${'patch'}    | ${'only Fixed section'}
      ${'## [Unreleased]\n\n### Fixed\n- Fix 1\n- Fix 2'}       | ${'patch'}    | ${'multiple fixes'}
      ${'## [UNRELEASED]\n\n### FIXED\n- Bug'}                  | ${'patch'}    | ${'case insensitive matching'}
    `(
      'should return $expectedLevel for changelog with $reason',
      ({ changelogContent, expectedLevel }) => {
        mockedFs.readFileSync.mockReturnValue(changelogContent);

        const result = detectReleaseLevel(mockCore);

        expect(result).toBe(expectedLevel);
        expect(mockCore.info).toHaveBeenCalledWith('Found only Fixed sections - will create patch release');
        expect(mockCore.info).toHaveBeenCalledWith(`Release level: ${expectedLevel}`);
      },
    );
  });

  describe('complex changelog scenarios', () => {
    test('should handle changelog with multiple versions', () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New awesome feature

### Fixed
- Minor bug fix

## [1.0.0] - 2023-01-01

### Added
- Initial release
`;

      mockedFs.readFileSync.mockReturnValue(changelogContent);

      const result = detectReleaseLevel(mockCore);

      expect(result).toBe('minor');
    });

    test('should only look at unreleased section, not past versions', () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Fixed
- Just a bug fix

## [1.0.0] - 2023-01-01

### Added
- Old feature that should not affect current release
`;

      mockedFs.readFileSync.mockReturnValue(changelogContent);

      const result = detectReleaseLevel(mockCore);

      expect(result).toBe('patch');
    });
  });
});

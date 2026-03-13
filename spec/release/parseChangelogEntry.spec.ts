// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseChangelogEntry } = require('../../.github/scripts/parseChangelogEntry');

describe('parseChangelogEntry', () => {
  test('returns the full latest changelog entry without the heading', () => {
    const changelogContent = `# Change Log

## [4.9.0] - 2026-02-20

### Added

- Language localization for Portuguese

### Fixed

- TimelineMarkersHandler not releasing properly

## [4.8.1] - 2026-02-09

### Fixed

- Older fix
`;

    expect(parseChangelogEntry(changelogContent)).toBe(`### Added

- Language localization for Portuguese

### Fixed

- TimelineMarkersHandler not releasing properly`);
  });

  test('supports a changelog with only one release entry', () => {
    const changelogContent = `# Change Log

## [4.9.0] - 2026-02-20

### Added

- Initial release notes
`;

    expect(parseChangelogEntry(changelogContent)).toBe(`### Added

- Initial release notes`);
  });

  test('throws when no changelog entry exists', () => {
    expect(() => parseChangelogEntry('# Change Log\n\nNo release headings here.')).toThrow('No changelog entry found');
  });
});

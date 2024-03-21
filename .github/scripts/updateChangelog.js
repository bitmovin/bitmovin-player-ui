/**
 * Updates the changelog by replacing the changelog header with the correct version
 *
 * @param {string} changelogString the content of the changelog file
 * @param {string} version the player version to be released
 * @param {string} releaseDate the release date to be written to the changelog
 */
function updateChangeLog(changelogString, version, releaseDate) {
  const optionalBetaOrRc = '(-rc.d+)?(-(b|beta).d+)?';
  const changelogVersionRegExp = new RegExp(
    `\\[(development|develop|unreleased|${version})${optionalBetaOrRc}.*`,
    'gi',
  );

  const lastReleaseVersion = changelogString.match(/\[(\d+.\d+.\d+)\]/)[1];
  const changelogWithReleaseVersionAndDate = changelogString.replace(changelogVersionRegExp, `[${version}] - ${releaseDate}`);

  return changelogWithReleaseVersionAndDate.replace(
    '## 1.0.0 (2017-02-03)\n- First release\n\n',
    `## 1.0.0 (2017-02-03)\n- First release\n\n[${version}]: https://github.com/bitmovin/bitmovin-player-ui/compare/v${lastReleaseVersion}...v${version}\n`
  );
}

module.exports.updateChangeLog = updateChangeLog;

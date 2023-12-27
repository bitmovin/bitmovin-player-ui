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
    return changelogString.replace(changelogVersionRegExp, `[${version}] - ${releaseDate}`);
  }
  
  module.exports.updateChangeLog = updateChangeLog;
  
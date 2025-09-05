const fs = require('fs');

/**
 * Detects the release level (minor or patch) based on changelog content
 * 
 * @param {object} core - GitHub Actions core object for logging
 * @param {string} changelogPath - Path to the changelog file (defaults to './CHANGELOG.md')
 * @returns {string} - Returns 'minor' or 'patch'
 */
function detectReleaseLevel(core, changelogPath = './CHANGELOG.md') {
  const changelogContent = fs.readFileSync(changelogPath, { encoding: 'utf8', flag: 'r' });
  
  const unreleasedMatch = changelogContent.match(/## \[?unreleased\]?/i);
  if (!unreleasedMatch) {
    throw new Error('No unreleased section found in CHANGELOG.md');
  }
  
  const unreleasedStart = unreleasedMatch.index + unreleasedMatch[0].length;
  const nextSectionMatch = changelogContent.substring(unreleasedStart).match(/^## /m);
  const unreleasedEnd = nextSectionMatch ? unreleasedStart + nextSectionMatch.index : changelogContent.length;
  const unreleasedContent = changelogContent.substring(unreleasedStart, unreleasedEnd);
  
  core.info('Unreleased section content:');
  core.info(unreleasedContent);
  
  const hasAdded = /### added/i.test(unreleasedContent);
  const hasChanged = /### changed/i.test(unreleasedContent);
  const hasRemoved = /### removed/i.test(unreleasedContent);
  const hasFixed = /### fixed/i.test(unreleasedContent);
  
  let releaseLevel;
  if (hasAdded || hasChanged || hasRemoved) {
    releaseLevel = 'minor';
    core.info('Found Added, Changed, or Removed sections - will create minor release');
  } else if (hasFixed) {
    releaseLevel = 'patch';
    core.info('Found only Fixed sections - will create patch release');
  } else {
    throw new Error('No valid changelog entries found in unreleased section');
  }
  
  core.info(`Release level: ${releaseLevel}`);
  return releaseLevel;
}

module.exports.detectReleaseLevel = detectReleaseLevel;

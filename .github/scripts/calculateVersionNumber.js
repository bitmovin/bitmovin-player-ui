const semver = require('semver');

/**
 * Calculates the full version number based on release type and input version
 * 
 * @param {object} core - GitHub Actions core object for logging
 * @param {string} inputVersionNumber - Base version number (e.g., "3.102.1")
 * @param {string} releaseType - Type of release (alpha, beta, rc, final)
 * @param {string} latestTag - Latest existing tag for this version and release type - optional
 * @returns {object} - Returns object with version_number, major_version, and tag_name
 */
function calculateVersionNumber(core, inputVersionNumber, releaseType, latestTag = '') {
  const isValid = semver.valid(inputVersionNumber);
  if (!isValid) {
    throw new Error(`Invalid version number: ${inputVersionNumber}`);
  }
  
  let fullVersion;
  if (releaseType === 'final') {
    fullVersion = inputVersionNumber;
  } else {
    let shortName;
    switch (releaseType) {
      case 'alpha':
        shortName = 'a';
        break;
      case 'beta':
        shortName = 'b';
        break;
      case 'rc':
        shortName = 'rc';
        break;
      default:
        throw new Error(`Invalid release type: ${releaseType}`);
    }
    
    let nextNumber = 1;
    if (latestTag) {
      const match = latestTag.match(new RegExp(`^v${inputVersionNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-${shortName}\\.(\\d+)$`));
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    fullVersion = `${inputVersionNumber}-${shortName}.${nextNumber}`;
    core.info(`Short name: ${shortName}, Latest tag: ${latestTag || 'none'}, next number: ${nextNumber}`);
  }
  
  const isFullVersionValid = semver.valid(fullVersion);
  if (!isFullVersionValid) {
    throw new Error(`Generated invalid version: ${fullVersion}`);
  }
  
  const majorVersion = semver.major(fullVersion);
  const tagName = `v${fullVersion}`;
  
  core.info(`Input version: ${inputVersionNumber}`);
  core.info(`Release type: ${releaseType}`);
  core.info(`Full version: ${fullVersion}`);
  core.info(`Major version: ${majorVersion}`);
  core.info(`Tag name: ${tagName}`);
  
  return {
    version_number: fullVersion,
    major_version: majorVersion,
    tag_name: tagName
  };
}

module.exports.calculateVersionNumber = calculateVersionNumber;
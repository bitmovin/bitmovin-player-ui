const semver = require('semver');

function getPlayerUiVersion(versionInput) {
  const playerUiVersion = semver.valid(versionInput);
  if (!playerUiVersion) {
    console.error(`${versionInput} is not a valid semver`);
    process.exit(1);
  }

  return {
    major: semver.major(playerUiVersion),
    minor: semver.minor(playerUiVersion),
    patch: semver.patch(playerUiVersion),
    prereleaseLabels: semver.prerelease(playerUiVersion),
    full: playerUiVersion,
  };
}

function defineReleaseVersion({ core }, targetReleaseLevel, givenVersion) {
  core.info(`Defining new release version for level ${targetReleaseLevel} and version ${givenVersion}`);

  const newVersion = semver.inc(givenVersion, targetReleaseLevel);

  const parsedPlayerVersion = getPlayerUiVersion(newVersion);
  core.info(`Using release version ${parsedPlayerVersion.full}`);
  return parsedPlayerVersion;
}

module.exports.defineReleaseVersion = defineReleaseVersion;

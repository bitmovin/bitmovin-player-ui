/**
 * Extracts the changelog entry for a specific version.
 *
 * @param {string} changelogContent - The full changelog file content
 * @param {string} version - The version number to extract (without 'v' prefix)
 * @returns {string} The changelog entry content (without the ## heading)
 * @throws {Error} If no changelog entry is found for the given version
 */
function parseChangelogEntry(changelogContent, version) {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`## \\[v?${escapedVersion}\\][\\s\\S]*?(?=\\n## |$)`, 'm');
  const match = changelogContent.match(regex);

  if (!match) {
    throw new Error(`No changelog entry found for version ${version}`);
  }

  return match[0].replace(/^## .*\n/, '').trim();
}

module.exports.parseChangelogEntry = parseChangelogEntry;

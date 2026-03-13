/**
 * Extracts the first (latest) changelog entry from a changelog string.
 *
 * @param {string} changelogContent - The full changelog file content
 * @returns {string} The changelog entry content (without the ## heading)
 * @throws {Error} If no changelog entry is found
 */
function parseChangelogEntry(changelogContent) {
  const match = changelogContent.match(/## \[[\s\S]*?(?=\n## |$)/);

  if (!match) {
    throw new Error('No changelog entry found');
  }

  return match[0].replace(/^## .*\n/, '').trim();
}

module.exports.parseChangelogEntry = parseChangelogEntry;

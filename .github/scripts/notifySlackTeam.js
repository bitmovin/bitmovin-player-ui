/**
 * This script posts a Slack message about a player release to a specified
 * channel and parses and attaches the internal changelog for this release.
 *
 * Environment Variables:
 * - `PCI_BRANCH` - used in `common.js`
 *
 * Parameter:
 * - `sdkType` - Specifies whether the release is for `web`, `android`, `ios`
 *               or `roku`. Is used for building the URL to the CDN and
 *               selecting the right Slack channel.
 * - `changelogPath` - The path to the CHANGELOG.md file.
 *
 * Dependencies:
 * - `fs-extra`
 * - `node-slack`
 * - `./common.js`
 */

const fs = require('fs');
const Slack = require('node-slack');

const releaseVersion = process.argv[2];
const changelogPath = process.argv[3];
const sdkType = 'UI';

const slackChannel = '#player-web-dev';
const cdnUrl = 'https://cdn.bitmovin.com/player/web/8/bitmovinplayer-ui.js';

const urlWebHook = 'https://hooks.slack.com/services/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';
const slack = new Slack(urlWebHook);
const versionUrl = `<${cdnUrl}|v${releaseVersion}>`;

fs.readFile(changelogPath, 'utf8', (err, fileContent) => {
  if (err) {
    throw err;
  }

  const changelogContent = parseChangelogEntry(fileContent);
  sendSlackMessage(slackChannel, releaseVersion, changelogContent, versionUrl);
});

function parseChangelogEntry(fileContent) {
  // The regex looks for the first paragraph starting with "###" until it finds
  // a paragraph starting with "##".
  // For some reason it also matches 2 chars at the end. With the .slice
  // those 2 chars get removed from the string.
  const regex = /###(.)*[\s\S]*?(?=\s##\s\[v*?)/;

  let changelogContent = fileContent.match(regex);
  changelogContent = changelogContent.slice(0, -1);
  return changelogContent.toString();
}

function sendSlackMessage(slackChannel, releaseVersion, changelogContent, versionUrl) {
  slack.send({
    channel: slackChannel,
    username: 'player-release-bot',
    text: `New ${sdkType} player version is released!`,
    attachments: [
      {
        title: 'CHANGELOG v' + releaseVersion,
        color: '#0e7aff',
        fallback: 'Changelog of the newest release should be displayed here',
        text: changelogContent,
        fields: [
          {
            title: 'Version',
            value: versionUrl,
            short: true,
          },
        ],
      },
    ],
  });
}

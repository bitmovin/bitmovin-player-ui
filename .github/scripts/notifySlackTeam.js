const fs = require('fs');
const https = require('https');

const versionNumber = process.argv[2];
const jobStatus = process.argv[3];
const changelogPath = process.argv[4];
const slackWebhookUrl = process.argv[5];
const runId = process.argv[6];

const failureSlackChannelId = 'CGRK9DV7H';
const successSlackChannelId = 'C0LJ16JBS';

fs.readFile(changelogPath, 'utf8', (err, fileContent) => {
  if (err) {
    throw err;
  }

  const changelogContent = parseChangelogEntry(fileContent);
  sendSlackMessage(versionNumber, changelogContent);
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

function sendSlackMessage(releaseVersion, changelogContent) {
  const slackChannelId = jobStatus === 'success' ? successSlackChannelId : failureSlackChannelId;
  
  const generalPayload = {
    channel: slackChannelId,
    username: 'Player UI release bot'
  };

  let payload;
  if (jobStatus === 'success') {
    payload = {
      ...generalPayload,
      text: `New Bitmovin Player UI version is released!`,
      attachments: [
        {
          title: `CHANGELOG v${releaseVersion}`,
          color: '#0e7aff',
          fallback: 'Changelog of the newest release should be displayed here',
          text: changelogContent,
          fields: [
            {
              title: 'Version',
              value: `v${releaseVersion}`,
              short: true,
            },
            {
              title: 'Channel',
              value: releaseVersion.includes('-') ? 'pre-release' : 'release',
              short: true,
            },
          ],
        },
      ],
    }
  } else {
    payload = {
      ...generalPayload,
      text: `Release v${releaseVersion} failed.`,
      attachments: [
        {
          title: `Release Failure`,
          color: '#ff0000',
          fallback: 'Release failed',
          text: `Please check the <https://github.com/bitmovin/bitmovin-player-ui/actions/runs/${runId}|failed run>`,
        },
      ],
    }
  }

  const sampleData = JSON.stringify(payload);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': "application/json",
    }
  };

  var req = https.request(slackWebhookUrl, options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
  
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  
  req.on('error', (e) => {
    console.error(e);
  });
  
  req.write(sampleData);
  req.end();
}

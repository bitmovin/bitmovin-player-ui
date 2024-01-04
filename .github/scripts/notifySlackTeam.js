const fs = require('fs');
const https = require('https');

const jobStatus = process.argv[2];
const changelogPath = process.argv[3];
const releaseVersion = process.argv[4];
const slackWebhookUrl = process.argv[5];
const runId = process.argv[6];
const jobId = process.argv[7];

const slackChannelId = 'C06BYVC27QU'

fs.readFile(changelogPath, 'utf8', (err, fileContent) => {
  if (err) {
    throw err;
  }

  const changelogContent = parseChangelogEntry(fileContent);
  sendSlackMessage(slackChannelId, releaseVersion, changelogContent);
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

function sendSlackMessage(slackChannelId, releaseVersion, changelogContent) {
  let message;
  if (jobStatus === 'success') {
    message = `Changelog v${releaseVersion}\n${changelogContent}`
  } else {
    message = `Release v${releaseVersion} failed.\nPlease check https://github.com/bitmovin/bitmovin-player-ui/actions/runs/${runId}/job/${jobId}`
  }

  const sampleData = JSON.stringify({
    "channel": slackChannelId,
    "message": message
  });
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

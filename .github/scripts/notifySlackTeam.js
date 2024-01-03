const fs = require('fs');
const https = require('https');

const changelogPath = process.argv[2];
const releaseVersion = process.argv[3];
const slackChannelId = process.argv[4];
const slackWebhookUrl = process.argv[5];

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
  const sampleData = JSON.stringify({
    "channel": slackChannelId,
    "message": `Changelog v${releaseVersion}\n${changelogContent}`
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

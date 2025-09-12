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
  let blocks;
  let slackChannelId;
  if (jobStatus === 'success') {
    slackChannelId = successSlackChannelId
    blocks = [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `Player UI release bot`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Changelog *v${releaseVersion}*`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": changelogContent
        }
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": `*Version*\n*v${releaseVersion}*`
          },
          {
            "type": "mrkdwn", 
            "text": `*Channel*\n${releaseVersion.includes('-') ? 'pre-release' : 'release'}`
          }
        ]
      }
    ]
  } else {
    slackChannelId = failureSlackChannelId
    blocks = [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `Player UI release bot`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Release *v${releaseVersion}* failed.\nPlease check the <https://github.com/bitmovin/bitmovin-player-ui/actions/runs/${runId}|failed run>`
        }
      }
    ]
  }

  const sampleData = JSON.stringify({
    "channel": slackChannelId,
    "blocks": blocks
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

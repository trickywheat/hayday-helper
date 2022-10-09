require('dotenv').config({ 'path': '../.env' });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('node:fs');
const path = require('node:path');


installSlashCommands().finally(function() {
  console.log('Installation Complete.');
});


async function installSlashCommands() {
  const commandsPath = path.join(__dirname);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'index.js');

  // Current Scope: GUILD
  const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_BOT_APP_ID}/guilds/${process.env.TARGET_GUILD_ID}/commands`;
  console.log(url);

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (Object.prototype.hasOwnProperty.call(command, 'discordSlashMetadata') && (command.discordSlashMetadata.type > 0)) {

      let commandMetadata = command.discordSlashMetadata;
      commandMetadata.name = commandMetadata.name.toLowerCase();

      console.log('Installing: ' + commandMetadata.name + ': (TYPE: ' + commandMetadata.type + ') ' + commandMetadata.description);
      await sendPayloadToDiscord(url, commandMetadata);
    }
  }
}

async function sendPayloadToDiscord(url, body, method = 'post') {
  const payloadJSON = {
    'method': method,
    'headers': {
      'Accept': '*/*',
    },
  };

  if (Object.keys(body).length > 0) {
    payloadJSON.body = JSON.stringify(body);
    payloadJSON.headers['Content-Type'] = 'application/json';
  }

  // Webhook URLs have 'webhooks' and the discord bot app ID.
  // These responses should be sent with the token that was
  // received in the original request.
  if (url.indexOf('webhooks/' + process.env.DISCORD_BOT_APP_ID) == -1) {
    payloadJSON.headers['Authorization'] = `Bot ${process.env.DISCORD_BOT_TOKEN}`;
  }

  console.log('Sending to url: ' + method + ' ' + url);
  console.log('Sending payload to Discord: ' + JSON.stringify(payloadJSON));
  const payloadResponse = await fetch(url, payloadJSON);
  console.log('Payload Response: ' + JSON.stringify(payloadResponse.headers.get('content-type')));

  let payloadResponseJSON = {};
  if (payloadResponse.headers.get('content-type') === 'application/json') {
    payloadResponseJSON = await payloadResponse.json();
  } else {
    payloadResponseJSON = {
      'status': payloadResponse.status,
      'statusText': payloadResponse.statusText,
    };
  }
  console.log('Discord reply: ' + JSON.stringify(payloadResponseJSON));

  return payloadResponseJSON;
}

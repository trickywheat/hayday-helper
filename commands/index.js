require('dotenv').config({'path': '../.env' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('node:fs');
const path = require('node:path');

const commandsPath = path.join(__dirname);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'index.js');

// Current Scope: GUILD
const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_BOT_APP_ID}/guilds/${process.env.TARGET_GUILD_ID}/commands`;
console.log(url);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  const requestJSON = {
    "method": 'post',
    "headers": {
      "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    "body": JSON.stringify(command.discordSlashMetadata)
  }
  
  console.log("sending: " + command.discordSlashMetadata.name + ": (TYPE: " + command.discordSlashMetadata.type + ") " + command.discordSlashMetadata.description);
  const response = fetch(url, requestJSON);

  Promise.all([response]).then((values) => { console.log(values); });
}

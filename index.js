const discordInteractions = require('discord-interactions');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('node:fs');
const path = require('node:path');
let commands = {};

exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  let responseJson = {
    statusCode: 418,
    headers: {
        'Content-Type': 'application/json',
    },
    body: '{"message": "I\'m a teapot"}',
  };

  let isValidRequest = false;

  if (event.headers.hasOwnProperty("postman-verify") && (event.headers['postman-verify'] === process.env.POSTMAN_VERIFY)) {
    isValidRequest = true;
  } else {
    // Get valid information
    const signature = event.headers['x-signature-ed25519'];
    const timestamp = event.headers['x-signature-timestamp'];
    const publicKey = process.env.DISCORD_BOT_PUBLIC_KEY;

    isValidRequest = discordInteractions.verifyKey(event.body, signature, timestamp, publicKey);
  }

  if (!isValidRequest) {
    responseJson.status = 401;
    responseJson.body = '{"message": "Bad request signature"}';
  } else {
    if ((event.requestContext.http.method === "POST") && (event.body.length > 1)) {
      const requestJSON = JSON.parse(event.body);

      console.log(JSON.stringify(requestJSON));
      if (requestJSON.type == 1) {
        // Handle Pings
        responseJson.statusCode = 200;
        responseJson.body = '{"type": 1}';
      } else if (requestJSON.data.name == 'ping') {
        responseJson.statusCode = 200;
        responseJson.body = '{"type": 4, "data": { "content": "PONG!" }}';
      } else {
        responseJson.statusCode = 200;
        responseJson.body = '{"type": 4, "data": { "content": "Command does not exist." }}';
      }
    }
  }
  
  return responseJson;
};


function loadCommands() {
  const commandsPath = path.join(__dirname);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'index.js');

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    commands[command.discordSlashMetadata.name] = command;

    console.log("Loaded: " + command.discordSlashMetadata.name + ": (TYPE: " + commands[command.discordSlashMetadata.name].type + ") " + commands[command.discordSlashMetadata.name].description);
    
  }

}
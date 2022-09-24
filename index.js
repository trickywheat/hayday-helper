const discordInteractions = require('discord-interactions');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('node:fs');
const path = require('node:path');
let botCommands = {};

exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  let responseJson = {
    statusCode: 418,
    headers: {
        'Content-Type': 'application/json',
    },
    body: '{"message": "I am a teapot"}',
  };

  let isValidRequest = false;

  if (event.headers.hasOwnProperty("authorization") && 
     (event.headers['authorization'] === "Bearer " + process.env.POSTMAN_VERIFY)) {
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
      } else if (requestJSON.data.hasOwnProperty("name") || requestJSON.data.hasOwnProperty("custom_id")) { 
        const command = requestJSON.data.name || requestJSON.data.custom_id || "does-not-exist";
        console.log("Discord sent command: " + command);
        const botCommand = loadCommand(command);

        if (botCommand.hasOwnProperty('discordSlashMetadata')) {
          console.log("Executing command module for " + botCommand.discordSlashMetadata.name);
          responseJson.statusCode = 200;
          responseJson.body = JSON.stringify(await botCommand.execute(requestJSON, event.requestContext));
        } else {
          responseJson.statusCode = 200;
          const responseBody = {
            "type": 4, 
            "data": { 
              "content": "Command `" + command + "` does not exist.  Request Id: `' + event.requestContext.requestId + '`"
            }
          };
          responseJson.body = JSON.stringify(responseBody);
        }
      }
    }
  }

  console.log("respondJson: " + JSON.stringify(responseJson));
  return responseJson;
};


function loadCommand(targetCommand) {
  const commandsPath = path.join(__dirname + '/commands');
  const commandFilename = targetCommand + ".js";
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file === commandFilename && file != 'index.js');

  if (commandFiles.length == 0) return {};

  const filePath = path.join(commandsPath, commandFilename);
  console.log("Loading: " + filePath);
  const command = require(filePath);

  console.log("Loaded: " + command.discordSlashMetadata.name + ": (TYPE: " + command.discordSlashMetadata.type + ") " + command.discordSlashMetadata.description);

  return command;
}
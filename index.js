const discordInteractions = require('discord-interactions');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('node:fs');
const path = require('node:path');

exports.handler = async (event, context) => {
  console.log("webhookIntake - event: " + JSON.stringify(event));
  console.log("webhookIntake - context: " + JSON.stringify(context));

  let responseJson = {
    statusCode: 418,
    headers: {
        'Content-Type': 'application/json',
    },
    body: '{"message": "I am a teapot"}',
  };

  let isValidRequest = false;

  // If running this with POSTMAN, check headers
  if (event.hasOwnProperty('headers') && event.headers.hasOwnProperty('authorization') && 
     (event.headers.authorization === "Bearer " + process.env.POSTMAN_VERIFY)) {
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
    // It's a valid request.  Set status to 200 universally
    responseJson.statusCode = 200;

    // Check to see if Discord sent this via POST webhook
    // or if it is a callback
    if (((event.hasOwnProperty('requestContext') && (event.requestContext.hasOwnProperty('http')) && 
          ((event.requestContext.http.method === "POST") && (event.body.length > 1)))) || 
        (event.hasOwnProperty('callbackExecute'))) {
      const requestJSON = JSON.parse(event.body);
      console.log("requestJson: " + JSON.stringify(requestJSON));

      // Must be able to respond to a valid PING:
      // https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction
      if (requestJSON.type == 1) {
        responseJson.body = '{"type": 1}';

      // Check to see if a command is being requested
      // is available as a module.
      } else if (requestJSON.data.hasOwnProperty("name") || requestJSON.data.hasOwnProperty("custom_id")) { 
        const command = requestJSON.data.name || requestJSON.data.custom_id || "does-not-exist";
        console.log("Discord sent command: " + command);

        // Attempt to load the command that was received.
        // function loadCommand returns an empty object if no such command was found.
        const botCommand = loadCommand(command);
        if (botCommand.hasOwnProperty('discordSlashMetadata') && (event.hasOwnProperty('callbackExecute') === false)) {
          console.log("Executing command module for " + botCommand.discordSlashMetadata.name);
          responseJson.body = JSON.stringify(await botCommand.execute(requestJSON, event, context));

        } else if (botCommand.hasOwnProperty('discordSlashMetadata') && (event.callbackExecute <= 3)) {
          console.log("Executing callback module for " + botCommand.discordSlashMetadata.name);
          responseJson.body = JSON.stringify(await botCommand.callbackExecute(requestJSON, event, context));

        } else if (event.callbackExecute <= 3) {
          const responseBody = {
            "type": 4, 
            "data": { 
              "content": "Unable to execute `" + command + "` due to invocation limit.  Request Id: `" + event.requestContext.requestId + "`",
              "flags": 1 << 6  // Ephemeral message -- viewable by invoker only
            }
          }
          responseJson.body = JSON.stringify(responseBody);        
        } else {
          const responseBody = {
            "type": 4, 
            "data": { 
              "content": "Command `" + command + "` does not exist.  Request Id: `" + event.requestContext.requestId + "`",
              "flags": 1 << 6  // Ephemeral message -- viewable by invoker only
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
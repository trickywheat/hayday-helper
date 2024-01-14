import { verifyKey } from 'discord-interactions';

import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = async (event, context) => {
  console.log('webhookIntake - event: ' + JSON.stringify(event));
  console.log('webhookIntake - context: ' + JSON.stringify(context));

  const responseJson = {
    statusCode: 418,
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{"message": "I am a teapot"}',
  };

  let isValidRequest = false;

  // If running this with POSTMAN, check headers
  if (Object.prototype.hasOwnProperty.call(event, 'headers') && Object.prototype.hasOwnProperty.call(event.headers, 'authorization') &&
     (event.headers.authorization === 'Bearer ' + process.env.POSTMAN_VERIFY)) {
    isValidRequest = true;
  } else {
    // Get valid information
    const signature = event.headers['x-signature-ed25519'];
    const timestamp = event.headers['x-signature-timestamp'];
    const publicKey = process.env.DISCORD_BOT_PUBLIC_KEY;

    isValidRequest = verifyKey(event.body, signature, timestamp, publicKey);
  }

  if (!isValidRequest) {
    responseJson.statusCode = 401;
    responseJson.body = '{"message": "Bad request signature"}';
  } else {
    // It's a valid request.  Set status to 200 universally
    responseJson.statusCode = 200;

    // Check to see if Discord sent this via POST webhook
    // or if it is a callback
    if (((Object.prototype.hasOwnProperty.call(event, 'requestContext') && Object.prototype.hasOwnProperty.call(event.requestContext, 'http')) &&
          ((event.requestContext.http.method === 'POST') && (event.body.length > 1))) ||
        Object.prototype.hasOwnProperty.call(event, 'callbackExecute')) {
      const requestJSON = JSON.parse(event.body);
      console.log('requestJson: ' + JSON.stringify(requestJSON));

      // Must be able to respond to a valid PING:
      // https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction
      if (requestJSON.type == 1) {
        responseJson.body = '{"type": 1}';

      // Check to see if a command is being requested
      // is available as a module.
      } else if (Object.prototype.hasOwnProperty.call(requestJSON.data, 'name') || Object.prototype.hasOwnProperty.call(requestJSON.data, 'custom_id')) {
        const command = requestJSON.data.name || requestJSON.data.custom_id || 'does-not-exist';
        console.log('Discord sent command: ' + command);

        // Attempt to load the command that was received.
        // function loadCommand returns an empty object if no such command was found.
        const botCommand = await loadCommand(command);
        if (Object.prototype.hasOwnProperty.call(botCommand, 'discordSlashMetadata') && Object.prototype.hasOwnProperty.call(event, 'callbackExecute') === false) {
          console.log('Executing command module for ' + botCommand.discordSlashMetadata.name);
          responseJson.body = JSON.stringify(await botCommand.execute(requestJSON, event, context));

        // If the the command has discordSlashMetadata, then it's a real command.  But make sure we're not executing this
        // more than 3 times.
        } else if (Object.prototype.hasOwnProperty.call(botCommand, 'discordSlashMetadata') && (event.callbackExecute <= 3)) {
          console.log('Executing callback module for ' + botCommand.discordSlashMetadata.name);
          responseJson.body = JSON.stringify(await botCommand.callbackExecute(requestJSON, event, context));

        // If we're executing this 3 times or more, return an error
        } else if (event.callbackExecute <= 3) {
          // Ephemeral message -- viewable by invoker only
          const responseBody = {
            'type': 4,
            'data': {
              'content': 'Unable to execute `' + command + '` due to invocation limit.  Request Id: `' + event.requestContext.requestId + '`',
              'flags': 1 << 6,
            },
          };
          responseJson.body = JSON.stringify(responseBody);
        } else {
          // Ephemeral message -- viewable by invoker only
          const responseBody = {
            'type': 4,
            'data': {
              'content': 'Command `' + command + '` does not exist.  Request Id: `' + event.requestContext.requestId + '`',
              'flags': 1 << 6,
            },
          };
          responseJson.body = JSON.stringify(responseBody);
        }
      }
    }
  }

  console.log('respondJson: ' + JSON.stringify(responseJson));
  return responseJson;
};


async function loadCommand(targetCommand) {
  const commandsPath = join(__dirname + '/commands');
  const commandFilename = targetCommand + '.js';
  const commandFiles = readdirSync(commandsPath).filter(file => file.toLowerCase() === commandFilename.toLowerCase() && file != 'index.js');

  if (commandFiles.length == 0) return {};

  const filePath = join(commandsPath, commandFiles[0]);
  console.log('Loading: ' + filePath);
  const command = await import(filePath);

  console.log('Loaded: ' + filePath + ': (TYPE: ' + command.discordSlashMetadata.type + ') ' + command.discordSlashMetadata.description);

  return command;
}

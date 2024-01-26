import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { discordConstants } from './discordConsts.js';

import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function invokeLambda(lambdaEvent, lambdaContext) {
  const responseJson = {
    'type': discordConstants.responseInteractionType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  // Build Lambda Payload
  const payloadJSON = {
    'callbackExecute': lambdaEvent.callbackExecute + 1 || 1,
    'headers': lambdaEvent.headers,
    'body': lambdaEvent.body,
  };

  const commandInput = {
    FunctionName: lambdaContext.invokedFunctionArn,
    InvocationType: 'Event',
    Payload: JSON.stringify(payloadJSON),
  };

  // Set up LambdaClient
  const client = new LambdaClient({ region: 'us-east-1' });

  console.log('Invoking lambda: ' + commandInput.FunctionName);
  const command = new InvokeCommand(commandInput);
  try {
    const lambdaResponse = await client.send(command);
    console.log('Response from Lambda: ' + JSON.stringify(lambdaResponse));

    if (lambdaResponse.StatusCode != 202) {
      responseJson.type = discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE;
      responseJson.data.content = `There was an issue executing \`${commandInput.FunctionName}\`.  requestId=\`${lambdaContext.awsRequestId}\``;
    }
  } catch (error) {
    responseJson.type = discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE;
    responseJson.data.content = `There was an error with \`requestHelpMessage\`.  requestId=\`${lambdaContext.awsRequestId}\`\n${JSON.stringify(error)}`;
  }

  return responseJson;
}

export async function sendPayloadToDiscord(url, body, method = 'post') {
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

  // Webhook URLs have the discord bot app ID.
  if (url.indexOf(process.env.DISCORD_BOT_APP_ID) == -1)
    payloadJSON.headers['Authorization'] = `Bot ${process.env.DISCORD_BOT_TOKEN}`;

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

export async function loadModule(targetCommand, baseDir = '') {
  const commandsPath = join(__dirname + '/' + baseDir);
  const commandFilename = targetCommand + '.js';
  const commandFiles = readdirSync(commandsPath).filter(file => file.toLowerCase() === commandFilename.toLowerCase() && file != 'index.js');

  let filePath = {};
  if (commandFiles.length == 1) {
    filePath = join(commandsPath, commandFiles[0]);
  } else if (commandFiles.length == 0) {
    const commandFile = join(commandsPath + '/' + targetCommand + '/index.js');
    filePath = (existsSync(commandFile) ? commandFile : null);
  }

  if (filePath == null) return {};
  console.log('Loading: ' + filePath);
  const command = await import(filePath);

  console.log('Loaded: ' + filePath + ': (TYPE: ' + command.discordSlashMetadata.type + ') ' + command.discordSlashMetadata.description);

  return command;
}

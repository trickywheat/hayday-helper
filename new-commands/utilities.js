import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { discordConstants } from './discordConsts.js';

import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

export async function readJSONFile(filename) {
  const pathToFile = join(__dirname + '/' + filename);
  const data = readFileSync(pathToFile);
  return JSON.parse(data);
}

export async function sendRequestEmbed(targetChannel, { embedObject, componentObject = {} }) {
  const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;
  const messageComponents = {
    'embeds': [
      {
        ...embedObject,
      },
    ],
  };

  if (Object.prototype.hasOwnProperty.call(componentObject, 'type'))
    messageComponents.components = [ componentObject ];

  console.log('Sending post embed: ' + JSON.stringify(messageComponents));
  const postEmbedRequestJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}

export async function createThread(channelId, starterMessageId, threadName) {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${starterMessageId}/threads`;
  const threadDetails = {
    'name': threadName,
  };

  console.log('Sending thread request...');
  const startThreadRequestJSON = await sendPayloadToDiscord(url, threadDetails);
  console.log('Thread request response: ' + JSON.stringify(startThreadRequestJSON));

  return startThreadRequestJSON;
}

export async function inviteGuildMemberToThread(channelId, guildMemberId) {
  const url = `https://discord.com/api/v10/channels/${channelId}/thread-members/${guildMemberId}`;

  console.log('Inviting GuildMember to Thread...');
  const payloadResponse = await sendPayloadToDiscord(url, {}, 'put');

  // should return status 204
  return payloadResponse;
}

export async function resolveDeferredToken(applicationId, requestToken, message) {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${requestToken}`;

  const payloadBody = {
    'content': message,
  };

  console.log('Giving the official 200 OK to the temporary message sent when modal was submitted...');
  const payloadResponse = await sendPayloadToDiscord(url, payloadBody);

  return payloadResponse;
}
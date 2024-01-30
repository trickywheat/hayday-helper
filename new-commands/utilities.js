import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { discordConstants } from './discordConsts.js';

import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __basedir = resolve(__dirname, '../');

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
    'method': method.toUpperCase(),
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

  console.log('Sending to url: ' + method.toUpperCase() + ' ' + url);
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
      'body': await payloadResponse.text(),
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
  const pathToFile = join(__basedir, filename);
  console.log(`readJSONFile: Reading ${pathToFile}`);
  const data = readFileSync(pathToFile);
  return JSON.parse(data);
}

export async function sendMessage(targetChannel, messageObject) {
  const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;

  console.log('Sending message: ' + JSON.stringify(messageObject));
  const postEmbedRequestJSON = await sendPayloadToDiscord(url, messageObject);
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

export async function addReaction(channelId, messageId, emoji) {
  const encodedEmoji = (emoji.includes(':') ? emoji : encodeURI(emoji));
  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`;

  console.log('Reacting to message with emoji');
  const payloadResponse = await sendPayloadToDiscord(url, {}, 'put');

  return payloadResponse;
}

export async function getChannelInformation(channelId) {
  // Get thread info
  const url = `https://discord.com/api/v10/channels/${channelId}`;
  console.log('Getting channel information for threadId: ' + channelId);
  const channelInfoJSON = await sendPayloadToDiscord(url, {}, 'get');

  return channelInfoJSON;
}

export async function getRequestMessageContents(parentId, channelId) {
  const url = `https://discord.com/api/v10/channels/${parentId}/messages/${channelId}`;
  console.log('Getting message contents for initial embed...');
  const messageContentsJSON = await sendPayloadToDiscord(url, {}, 'get');

  return messageContentsJSON;
}

export async function deleteThread(channelId) {
  const url = `https://discord.com/api/v10/channels/${channelId}`;

  const deleteResponse = await sendPayloadToDiscord(url, {}, 'delete');

  return deleteResponse;
}

export async function getRequestTypeConfig(guildId, requestType) {
  // Let's try to find the Label from requestType
  const serverConfig = await readJSONFile(`./config/${guildId}.json`);
  const requestHelpConfig = { ...serverConfig.requestTypes.find(i => i.value == requestType) };

  const configFields = ['targetChannel', 'label', 'value', 'description', 'placeholder', 'emoji', 'colors', 'initialThreadMessage'];

  const returnObject = {};
  configFields.forEach(i => {
    returnObject[i] = requestHelpConfig[i] || serverConfig.requestMeta[i];
  });

  return returnObject;
}

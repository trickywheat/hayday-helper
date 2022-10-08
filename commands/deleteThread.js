/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/

require('dotenv').config({ 'path': '../.env' });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  'discordSlashMetadata': {
    'name': 'deleteThread',
    'type': 1,
    'description': 'Deletes a Request Thread; Must be used in the thread to be deleted.',
  },

  async execute(requestJSON, lambdaEvent, lambdaContext) {
    const responseJson = {
      'type': 5,
      'data': {
        'flags': 1 << 6,
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
    const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
    const client = new LambdaClient({ region: 'us-east-1' });

    console.log('Invoking lambda: ' + commandInput.FunctionName);
    const command = new InvokeCommand(commandInput);
    try {
      const lambdaResponse = await client.send(command);
      console.log('Response from Lambda: ' + JSON.stringify(lambdaResponse));

      if (lambdaResponse.StatusCode != 202) {
        responseJson.type = 4;
        responseJson.data.content = `There was an issue executing \`${commandInput.FunctionName}\`.  requestId=\`${lambdaContext.awsRequestId}\``;
      }
    } catch (error) {
      responseJson.type = 4;
      responseJson.data.content = `There was an error with \`requestHelpMessage\`.  requestId=\`${lambdaContext.awsRequestId}\`\n${JSON.stringify(error)}`;
    }


    return responseJson;
  },

  // Since this is executed by Lambda, a Discord-type response is not needed,
  // but let's follow the convention
  async callbackExecute(requestJSON, _lambdaEvent, lambdaContext) {
    console.log('deleteThread - callbackExecute');
    // Ephemeral message -- viewable by invoker only
    const responseJson = {
      'type': 4,
      'data': {
        'content': 'Lambda callback executed.  requestId: `' + lambdaContext.awsRequestId + '`',
        'flags': 1 << 6,
      },
    };

    const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
    const threadChannelId = requestJSON.channel_id;

    const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

    // If the bot owns the channel and it's a PUBLIC thread, then attempt to get the message contents.
    if ((threadChannelInfoJSON.owner_id === process.env.DISCORD_BOT_APP_ID) &&
        (threadChannelInfoJSON.type === 11)) {

      const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);

      // If the message contains an embeds, it's the initial message sent.  Edit the message
      if (Object.prototype.hasOwnProperty.call(messageContentsJSON, 'embeds')) {
        await editInitialMessageEmbed(messageContentsJSON, guildMember);
      }

      // Finally, delete the thread
      await deleteThread(threadChannelId);
    } else {
      await sendErrorMessage(requestJSON.application_id, requestJSON.token, lambdaContext.awsRequestId);
    }

    return responseJson;
  },
};


async function sendErrorMessage(applicationId, requestToken, requestId = 'unknown-requestId') {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${requestToken}`;
  const payloadBody = {
    'content': `Unable to delete this thread.  It might be a thread I am not permitted to delete.  If you think you are getting this in error, please tell my developer.  requestId: \`${requestId}\``,
  };

  console.log('Responding to initial status message.');
  const payloadResponse = await sendPayloadToDiscord(url, payloadBody);

  return payloadResponse;
}


async function editInitialMessageEmbed(messageContentsJSON, guildMember) {
  const messageEmbed = messageContentsJSON.embeds;

  messageEmbed[0].title += ' -- FULFILLED!';
  messageEmbed[0].color = 0xb73939;
  messageEmbed[0].footer.text += ' -- Thread closed by ' + guildMember;

  const url = `https://discord.com/api/v10/channels/${messageContentsJSON.channel_id}/messages/${messageContentsJSON.id}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}


async function getRequestMessageContents(parentId, channelId) {
  const url = `https://discord.com/api/v10/channels/${parentId}/messages/${channelId}`;
  console.log('Getting message contents for initial embed...');
  const messageContentsJSON = await sendPayloadToDiscord(url, {}, 'get');

  return messageContentsJSON;
}

async function getChannelInformation(channelId) {
  // Get thread info
  const url = `https://discord.com/api/v10/channels/${channelId}`;
  console.log('Getting channel information for threadId: ' + channelId);
  const threadChannelInfoJSON = await sendPayloadToDiscord(url, {}, 'get');
  console.log('Thread\'s Parent: ' + threadChannelInfoJSON.parent_id);

  return threadChannelInfoJSON;
}


async function deleteThread(channelId) {
  const url = `https://discord.com/api/v10/channels/${channelId}`;

  const deleteResponse = await sendPayloadToDiscord(url, {}, 'delete');

  return deleteResponse;
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

  // Webhook URLs have the discord bot app ID.
  if (url.indexOf(process.env.DISCORD_BOT_APP_ID) == -1) {payloadJSON.headers['Authorization'] = `Bot ${process.env.DISCORD_BOT_TOKEN}`;}

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
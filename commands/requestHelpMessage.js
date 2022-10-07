/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/
require('dotenv').config({ 'path': '../.env' });
const serverConfig = require('./serverConfig.json');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  'discordSlashMetadata': {
    'name': 'requestHelpMessage',
    'type': -1,
    'description': 'Processes Request Help Message modal',
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

    // responseJson.body = JSON.stringify(responseBody);
    return responseJson;
  },

  // Since this is executed by Lambda, a Discord-type response is not needed,
  // but let's follow the convention
  async callbackExecute(requestJSON, lambdaEvent, _lambdaContext) {
    console.log('requestHelpMessage - callbackExecute');
    // Ephemeral message -- viewable by invoker only
    const responseJson = {
      'type': 4,
      'data': {
        'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
        'flags': 1 << 6,
      },
    };

    const requestType = requestJSON.data.components[0].components[0].custom_id.split('_')[1];
    const requestHelpMessage = requestJSON.data.components[0].components[0].value;
    const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
    const applicationId = requestJSON.application_id;
    const requestToken = requestJSON.token;

    // Let's try to find the Label from requestType
    const requestHelpMenu = require('../commands/requestHelpMenu.js');
    const requestHelpChoice = requestHelpMenu.discordSlashMetadata.options[0].choices.find(element => element.value === requestType);

    // Build embed for the request channel
    const postEmbedRequestJSON = await sendRequestEmbed(requestJSON, guildMember, requestHelpChoice, requestHelpMessage);

    // Create Thread
    const createThreadRequestJSON = await createThread(postEmbedRequestJSON, guildMember, requestHelpChoice);

    // Invite Guild Member
    await inviteGuildMemberToThread(createThreadRequestJSON, requestJSON.member);

    // Send Inital Thread message
    const initialThreadMessageJSON = await sendInitialThreadMessage(createThreadRequestJSON, guildMember);

    // Send updated message that everything is fine
    await sendFinalMessage(applicationId, requestToken, initialThreadMessageJSON.channel_id);

    return responseJson;
  },
};

async function sendRequestEmbed(requestJSON, guildMember, requestHelpChoice, placeholder) {
  // If the specific choice channel is specified, then use that channel.  If not, use all.
  const targetChannel = serverConfig[requestJSON.guild_id].requestChannels[requestHelpChoice.value] || serverConfig[requestJSON.guild_id].requestChannels.all;
  const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;
  const messageComponents = {
    'embeds': [
      {
        'title': `Request: ${requestHelpChoice.label}`,
        'description': `${placeholder}`,
        'color': 0x00f721,
        'footer': {
          'text': `Requested by ${guildMember}`,
        },
      },
    ],
  };

  console.log('Sending post embed: ' + JSON.stringify(messageComponents));
  const postEmbedRequestJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}


async function createThread(postEmbedRequestJSON, guildMember, requestHelpChoice) {
  const url = `https://discord.com/api/v10/channels/${postEmbedRequestJSON.channel_id}/messages/${postEmbedRequestJSON.id}/threads`;
  const threadDetails = {
    'name': `${guildMember} request - ` + requestHelpChoice.label,
  };

  console.log('Sending thread request...');
  const startThreadRequestJSON = await sendPayloadToDiscord(url, threadDetails);
  console.log('Thread request response: ' + JSON.stringify(startThreadRequestJSON));

  return startThreadRequestJSON;
}

async function sendInitialThreadMessage(createThreadRequestJSON, guildMember) {
  const url = `https://discord.com/api/v10/channels/${createThreadRequestJSON.id}/messages`;

  // TODO: This will need to be updated for each type of request.
  const messageComponents = {
    'content': `Can you help out ${guildMember}?\nDiscuss your request in this thread.  Once you are done, click the button below (or use the slash command \`deletethread\`) to delete the thread.\n\n**WARNING:** Once a thread is deleted, it cannot be recovered.`,
    'components': [
      {
        'type': 1,
        'components': [
          {
            'type': 2,
            'style': 4,
            'label': 'Delete Thread',
            'custom_id': 'deleteThread',
          },
        ],
      }],
  };

  console.log('Sending initial thread message...');
  const initialThreadMessageJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log('initial Thread Message Response: ' + JSON.stringify(initialThreadMessageJSON));

  return initialThreadMessageJSON;
}

async function inviteGuildMemberToThread(createThreadRequestJSON, guildMember) {
  const url = `https://discord.com/api/v10/channels/${createThreadRequestJSON.id}/thread-members/${guildMember.user.id}`;

  console.log('Inviting GuildMember to Thread...');
  const payloadResponse = await sendPayloadToDiscord(url, {}, 'put');

  // should return status 204
  return payloadResponse;
}

async function sendFinalMessage(applicationId, requestToken, channelId) {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${requestToken}`;
  const payloadBody = {
    'content': `Your request thread has been created: <#${channelId}>  You may dismiss this message at anytime.`,
  };

  console.log('Giving the official 200 OK to the temporary message sent when modal was submitted...');
  const payloadResponse = await sendPayloadToDiscord(url, payloadBody);

  return payloadResponse;
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
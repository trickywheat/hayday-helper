/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/

const { callbackExecute } = require('./requestHelpMessage');

require('dotenv').config({"path": "../.env" });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
  "discordSlashMetadata": {
    "name": "deleteThread",
    "type": 1, 
    "description": "Delete Thread",
  },

  async execute(requestJSON, lambdaEvent, lambdaContext) {
    let responseJson = {
      "type": 5,
      "data": {
        "flags": 1 << 6
      }
    };

    // Build Lambda Payload
    const payloadJSON = {
        "callbackExecute": lambdaEvent.callbackExecute + 1 || 1,
        "headers": lambdaEvent.headers,
        "body": lambdaEvent.body
    };

    const commandInput = {
      FunctionName: lambdaContext.invokedFunctionArn,
      InvocationType: "Event",
      Payload: JSON.stringify(payloadJSON)
    }

    // Set up LambdaClient
    const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
    const client = new LambdaClient({ region: "us-east-1" });

    console.log('Invoking lambda: ' + commandInput.FunctionName);
    const command = new InvokeCommand(commandInput);
    try {
      const lambdaResponse = await client.send(command);
      console.log("Response from Lambda: " + JSON.stringify(lambdaResponse));

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
  async callbackExecute(requestJSON, lambdaEvent) {
    console.log("deleteThread - callbackExecute");
    let responseJson = {
      "type": 4,
      "data": {
        "content": "Lambda callback executed.  requestId `" + lambdaEvent.awsRequestId + "`",
        "flags": 1 << 6  // Ephemeral message -- viewable by invoker only
      }
    };

    const threadChannelId = requestJSON.channel_id;
    const deleteThreadJSON = await deleteThread(threadChannelId);
    return responseJson;
  }
};


async function deleteThread(channelId) {
  const url = `https://discord.com/api/v10/channels/${channelId}`;

  const deleteResponse = await sendPayloadToDiscord(url, {}, 'delete');

  return responseJson;  
}

async function sendPayloadToDiscord(url, body, method = 'post') {
  let payloadJSON = {
    "method": method,
    "headers": {
      "Accept": '*/*'
    }
  };

  if (Object.keys(body).length > 0) {
    payloadJSON.body = JSON.stringify(body);
    payloadJSON.headers['Content-Type'] = 'application/json';
  }

  // Webhook URLs have the discord bot app ID.
  if (url.indexOf(process.env.DISCORD_BOT_APP_ID) == -1)
    payloadJSON.headers['Authorization'] = `Bot ${process.env.DISCORD_BOT_TOKEN}`;

  console.log("Sending to url: " + method + " " + url);
  console.log("Sending payload to Discord: " + JSON.stringify(payloadJSON));
  const payloadResponse = await fetch(url, payloadJSON);
  console.log("Payload Response: " + JSON.stringify(payloadResponse.headers.get('content-type')));

  let payloadResponseJSON = {};
  if (payloadResponse.headers.get('content-type') === 'application/json') {
    payloadResponseJSON = await payloadResponse.json()
  } else {
    payloadResponseJSON = {
      "status": payloadResponse.status, 
      "statusText": payloadResponse.statusText
    };
  }
  console.log("Discord reply: " + JSON.stringify(payloadResponseJSON));

  return payloadResponseJSON;
}
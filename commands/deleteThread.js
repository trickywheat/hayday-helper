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
      "type": 5
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
      console.log("lambdaResponse: " + JSON.stringify(lambdaContext));
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
    
  async callbackExecute(requestJSON) {
    const channelId = requestJSON.channel_id;

    // Invite Guild Member
    const url = `https://discord.com/api/v10/channels/${channelId}`;

    // Cannot use function since this is a PUT
    const payloadJSON = {
      "method": 'delete',
      "headers": {
        "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    };
  
    console.log("Sending payload: " + JSON.stringify(payloadJSON));
    const payloadResponse = await fetch(url, payloadJSON);
    console.log("payload reply: " + JSON.stringify(payloadResponse));  // should return status 204

    return responseJson;
  }
};


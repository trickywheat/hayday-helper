/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/
require('dotenv').config({"path": "../.env" });
const serverConfig = require('./serverConfig.json');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
  "discordSlashMetadata": {
    "name": "requestHelpMessage",
    "type": 1, 
    "description": "Processes Request Help Message modal",
  },

  async execute(requestJSON, requestContext) {
    let responseJson = {
      "type": 5,
      "data": {
        "flags": 1 << 6
      }
    };

    let payloadJSON = requestJSON;
    payloadJSON.callbackExecute = true;

    const commandInput = {
      FunctionName: "Discord-webhookIntake",
      InvocationType: "Event",
      Payload: JSON.stringify(payloadJSON)
    }

    // Set up LambdaClient
    const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
    const client = new LambdaClient({ region: "us-east-1" });

    const command = new InvokeCommand(commandInput);
    try {
      const lambdaResponse = await client.send(command);
      console.log("Response from Lambda: " + JSON.stringify(lambdaResponse));

      if (lambdaResponse.StatusCode != 202) {
        responseJson.type = 4;
        responseJson.data.content = `There was an issue executing \`${commandInput.FunctionName}\`.  requestId=\`${requestContext.requestId}\``;
      }
    } catch (error) {
      responseJson.type = 4;
      responseJson.data.content = `There was an issue with \`webhookIntake\`.  requestId=\`${requestContext.requestId}\``;
    }

    // responseJson.body = JSON.stringify(responseBody);
    return responseJson;
  },

  async callbackExecute(requestJSON) {
    const requestType = requestJSON.data.components[0].components[0].custom_id.split("_")[1];
    const requestHelpMessage = requestJSON.data.components[0].components[0].value;
    const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  
    // Let's try to find the Label from requestType
    const requestHelpMenu = require("../commands/requestHelpMenu.js");
    const requestHelpChoiceLabel = requestHelpMenu.discordSlashMetadata.options[0].choices.find(element => element.value === requestType).label;
  
    // Build embed for the request channel
    const postEmbedRequestJSON = await sendRequestEmbed(requestJSON, guildMember, requestHelpChoiceLabel, requestHelpMessage); 
  
    // Create Thread
    const createThreadRequestJSON = await createThread(postEmbedRequestJSON, guildMember, requestHelpChoiceLabel);
  
    // Invite Guild Member
    const inviteGuildMemberToThreadJSON = await inviteGuildMemberToThread(createThreadRequestJSON, requestJSON.member);
  
    // Send Inital Thread message
    const initialThreadMessageJSON = await sendInitialThreadMessage(createThreadRequestJSON, guildMember);
  
    return responseJson;
  }
};

// TO DO: fix this for production
async function sendRequestEmbed(requestJSON, guildMember, label, placeholder) {
  const targetChannel = serverConfig[requestJSON.guild_id].requestChannels.all;  // TODO: Fix this for Production
  const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;
  let messageComponents = {
    "embeds": [
      {
        "title": `Request: ${label}`,
        "description": `${placeholder}`,
        "color": 0x00FFFF,
        "footer": {
          "text": `${guildMember}`
        }
      }
    ]
  };

  console.log("Sending post embed: " + JSON.stringify(messageComponents));
  const postEmbedRequestJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}


async function createThread(postEmbedRequestJSON, guildMember, requestHelpChoiceLabel) {
  const url = `https://discord.com/api/v10/channels/${postEmbedRequestJSON.channel_id}/messages/${postEmbedRequestJSON.id}/threads`;
  const threadDetails = {
    "name": `${guildMember} request - ` + requestHelpChoiceLabel,
  };

  console.log("Sending thread request...");
  const startThreadRequestJSON = await sendPayloadToDiscord(url, threadDetails);
  console.log("Thread request response: " + JSON.stringify(startThreadRequestJSON));

  return startThreadRequestJSON;
}

async function sendInitialThreadMessage(createThreadRequestJSON, guildMember) {
  const url = `https://discord.com/api/v10/channels/${createThreadRequestJSON.id}/messages`;

  // TODO: This will need to be updated for each type of request.
  const messageComponents = {
    "content": `Can you help out ${guildMember}?\nDiscuss your request in this thread.  Once you are done, click the buttom below to delete the thread.  **WARNING:** Once a thread is deleted, it cannot be recovered.`,
    "components": [
      {
        "type": 1,
        "components": [
            {
                "type": 2,
                "style": 4,
                "label": "Delete Thread",
                "custom_id": "deleteThread"
            }
        ]
    }]
  };

  console.log("Sending initial thread message...");
  const initialThreadMessageJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log("initial Thread Message Response: " + JSON.stringify(initialThreadMessageJSON));

  return initialThreadMessageJSON;
}

async function inviteGuildMemberToThread(createThreadRequestJSON, guildMember) {
  const url = `https://discord.com/api/v10/channels/${createThreadRequestJSON.id}/thread-members/${guildMember.user.id}`;

  // Cannot use function since this is a PUT
  const payloadJSON = {
    "method": 'put',
    "headers": {
      "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
    }
  };

  console.log("Sending payload: " + JSON.stringify(payloadJSON));
  const payloadResponse = await fetch(url, payloadJSON);
  console.log("payload reply: " + JSON.stringify(payloadResponse));  // should return status 204
}



async function sendPayloadToDiscord(url, body) {
  const payloadJSON = {
    "method": 'post',
    "headers": {
      "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    "body": JSON.stringify(body)
  };

  console.log("Sending payload: " + JSON.stringify(payloadJSON));
  const payloadResponse = await fetch(url, payloadJSON);
  const payloadResponseJSON = await payloadResponse.json();
  console.log("payload reply: " + JSON.stringify(payloadResponseJSON));

  return payloadResponseJSON;
}
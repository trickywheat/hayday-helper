/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/

require('dotenv').config({"path": "../.env" });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
  "discordSlashMetadata": {
    "name": "requestHelpMessage",
    "type": 1, 
    "description": "Processes Request Help Message modal",
  },

  async execute(requestJSON) {
    let responseJson = {
      "type": 6
    };

    const requestType = requestJSON.data.components[0].components[0].custom_id.split("_")[1];
    const requestHelpMessage = requestJSON.data.components[0].components[0].value;
    const guildMember = requestJSON.member.nick || requestJSON.member.user.username;

    // Let's try to find the Label from requestType
    const requestHelpMenu = require("./requestHelpMenu.js");
    const requestHelpChoiceLabel = requestHelpMenu.discordSlashMetadata.options[0].choices.find(element => element.value === requestType).label;

    // Build embed for the request channel
    const postEmbedRequestJSON = await sendRequestEmbed(guildMember, requestHelpChoiceLabel, requestHelpMessage); 

    // Create Thread
    const url = `https://discord.com/api/v10/channels/${postEmbedRequestJSON.channel_id}/messages/${postEmbedRequestJSON.id}/threads`;
    const threadDetails = {
      "name": `${guildMember} request - ` + requestHelpChoiceLabel,
    };

    console.log("Sending thread request...");
    const startThreadRequestJSON = await sendPayloadToDiscord(url, threadDetails);
    console.log("Thread request response: " + JSON.stringify(startThreadRequestJSON));

    return responseJson;
  }
};


// TO DO: fix this for production
async function sendRequestEmbed(guildMember, label, placeholder) {
  const targetChannel = "1015975409160032276";  // TODO: Fix this for Production
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
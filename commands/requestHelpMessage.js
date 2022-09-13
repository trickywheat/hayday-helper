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

    const targetChannel = "1015975409160032276";
    const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;
    let messageComponents = {
      "embeds": [
        {
          "title": `Request: ${requestHelpChoiceLabel}`,
          "description": `${requestHelpMessage}`,
          "color": 0x00FFFF,
          "footer": {
            "text": `${guildMember}`
          }
        }
      ]
    };

    const postToChannelJSON = {
      "method": 'post',
      "headers": {
        "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      "body": JSON.stringify(messageComponents)
    }

    const response = await fetch(url, postToChannelJSON);
    console.log(response);
    return responseJson;
  },
};
/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/

require('dotenv').config({"path": "../.env" });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
  "discordSlashMetadata": {
    "name": "deleteThread",
    "type": 1, 
    "description": "Delete Thread",
  },

  async execute(requestJSON) {
    let responseJson = {
      "type": 6
    };

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


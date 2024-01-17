import { dotenv } from 'dotenv';
dotenv.config({ 'path': '../.env' });

export async function installSlashCommand(body, method = 'post') {
  // Current Scope: GUILD
  const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_BOT_APP_ID}/guilds/${process.env.TARGET_GUILD_ID}/commands`;
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

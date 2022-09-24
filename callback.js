/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/
require('dotenv').config({"path": "../.env" });
const serverConfig = require('./commands/serverConfig.json');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (requestJSON) => {
  console.log("callback Lambda event object: " + JSON.stringify(requestJSON));

  if (requestJSON.data.hasOwnProperty("name") || requestJSON.data.hasOwnProperty("custom_id")) { 
    const command = requestJSON.data.name || requestJSON.data.custom_id || "does-not-exist";
    console.log("Discord sent command: " + command);
    const botCommand = loadCommand(command);

    if (botCommand.hasOwnProperty('discordSlashMetadata')) {
      console.log("Executing command module for " + botCommand.discordSlashMetadata.name);
      responseJson.statusCode = 200;
      responseJson.body = JSON.stringify(await botCommand.callbackExecute(requestJSON));
    } else {
      responseJson.statusCode = 200;
      const responseBody = {
        "type": 4, 
        "data": { 
          "content": "Command `" + command + "` does not exist.  Request Id: `' + event.requestContext.requestId + '`"
        }
      };
      responseJson.body = JSON.stringify(responseBody);
    }
  }

};

function loadCommand(targetCommand) {
  const commandsPath = path.join(__dirname + '/commands');
  const commandFilename = targetCommand + ".js";
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file === commandFilename && file != 'index.js');

  if (commandFiles.length == 0) return {};

  const filePath = path.join(commandsPath, commandFilename);
  console.log("Loading: " + filePath);
  const command = require(filePath);

  console.log("Loaded: " + command.discordSlashMetadata.name + ": (TYPE: " + command.discordSlashMetadata.type + ") " + command.discordSlashMetadata.description);

  return command;
}
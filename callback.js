/*
  requestHelpMessage Command
  Type: CHAT_INPUT
*/
require('dotenv').config({"path": "../.env" });
const serverConfig = require('./commands/serverConfig.json');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (requestJSON) => {
  console.log(requestJSON);

  const requestType = requestJSON.data.components[0].components[0].custom_id.split("_")[1];
  const requestHelpMessage = requestJSON.data.components[0].components[0].value;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;


};

function loadCommands() {
  const commandsPath = path.join(__dirname + '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'index.js');
  let pendingCommands = {};

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    pendingCommands[command.discordSlashMetadata.name] = command;

    console.log("Loaded: " + command.discordSlashMetadata.name + ": (TYPE: " + pendingCommands[command.discordSlashMetadata.name].discordSlashMetadata.type + ") " + pendingCommands[command.discordSlashMetadata.name].discordSlashMetadata.description);
  }

  return pendingCommands;
}
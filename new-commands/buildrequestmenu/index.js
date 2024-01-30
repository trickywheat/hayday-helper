import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';
import { invokeLambda, readJSONFile, resolveDeferredToken, sendMessage } from '../utilities.js';

export { discordSlashMetadata };

export async function execute(_requestJSON, lambdaEvent, lambdaContext) {
  const responseJson = await invokeLambda(lambdaEvent, lambdaContext);

  return responseJson;
}

// Since this is executed by Lambda, a Discord-type response is not needed,
// but let's follow the convention
export async function callbackExecute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('buildrequestmenu - callbackExecute');

  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaContext.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { guild_id: guildId, application_id: applicationId, token: requestToken, data: commandData } = requestJSON;
  const targetChannel = (Object.prototype.hasOwnProperty.call(commandData, 'options') && commandData.options.findIndex((i) => i.name == 'targetchannel') >= 0 ? commandData.options.find((i) => i.name == 'targetchannel').value : requestJSON.channel_id);

  const serverConfig = await readJSONFile(`./config/${guildId}.json`);

  const messageObject = {
    embeds: [ ...serverConfig.requestMeta ],
    components: [{
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.STRING_SELECT,
          'custom_id': 'requestHelpMenu',
          'options': [ ...buildMenuItems(serverConfig.requestTypes) ],
        },
      ],
    }],
  };

  const discordResponse = await sendMessage(targetChannel, messageObject);

  const panelLink = (Object.prototype.hasOwnProperty.call(discordResponse, 'id') ? `https://discord.com/channels/${guildId}/${discordResponse.channel_id}/${discordResponse.id}` : null);

  // If the message doesn't have an id, then the embed didn't go through.
  const resolutionMessage = (panelLink ? `Your menu has been created: ${panelLink}.  You may dismiss this message at anytime.` : `Unable to build the menu.  Please yell at my developer.  requestId: \`${lambdaContext.awsRequestId}\``);

  await resolveDeferredToken(applicationId, requestToken, resolutionMessage);

  return responseJson;
}

function buildMenuItems(requestTypesArray) {
  const returnArray = requestTypesArray.map((i) => {
    const optionObject = {
      'label': i.label,
      'value': i.value,
      'description': i.description || 'No description provided.',
    };

    if (Object.prototype.hasOwnProperty.call(i, 'emoji'))
      optionObject.emoji = { ...i.emoji };

    return optionObject;
  });

  return returnArray;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
}

if (process.env.INSTALL_COMMAND) {
  install().then(() => {
    console.log(`Command ${discordSlashMetadata.name} installed.`);
  });
}

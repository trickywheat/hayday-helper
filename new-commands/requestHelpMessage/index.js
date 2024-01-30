import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';
import { createThread, inviteGuildMemberToThread, invokeLambda, loadModule, readJSONFile, sendMessage } from '../utilities.js';

export { discordSlashMetadata };

export async function execute(_requestJSON, lambdaEvent, lambdaContext) {
  const responseJson = await invokeLambda(lambdaEvent, lambdaContext);

  return responseJson;
}

// Since this is executed by Lambda, a Discord-type response is not needed,
// but let's follow the convention
export async function callbackExecute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('requestHelpMessage - callbackExecute');

  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaContext.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, build_id: guildId } = requestJSON;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const requestType = requestJSON.data.components[0].components[0].custom_id.split('.')[1];
  const requestHelpMessage = requestJSON.data.components[0].components[0].value;

  // Let's try to find the Label from requestType
  const serverConfig = await readJSONFile(`./config/${guildId}.json`);
  const requestHelpConfig = serverConfig.requestTypes.find(i => i.value == requestType);

  // Build embed for the request channel
  const postEmbedRequestJSON = await buildRequestEmbed(requestJSON, guildMember, requestHelpConfig, requestHelpMessage);

  // Create the Thread
  const createThreadRequestJSON = await createThread(postEmbedRequestJSON.channel_id, postEmbedRequestJSON.id, postEmbedRequestJSON.embeds[0].title);

  await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  // Send Initial Thread Message
  const initialThreadMessageJSON = await sendInitialThreadMessage(createThreadRequestJSON, requestHelpConfig);

  await resolveDeferredToken(applicationId, requestToken, `Your request thread has been created: <#${initialThreadMessageJSON.channel_id}>  You may dismiss this message at anytime.`);

  return responseJson;
}


async function buildRequestEmbed(requestJSON, guildMember, requestTypeObject, requestHelpMessage) {
  const { guild_id: guildId } = requestJSON;
  const serverConfig = await readJSONFile(`./config/${guildId}.json`);

  const targetChannel = requestTypeObject.targetChannel;
  const embedColor = serverConfig.requestMeta.colors.requestOpen || 0;

  const embedObject = {
    'title': `Request: ${requestTypeObject.label}`,
    'description': requestHelpMessage,
    'color': embedColor,
    'footer': {
      'text': `Requested by ${guildMember}`,
    },
  };

  const postEmbedRequestJSON = await sendMessage(targetChannel, { embedObject });
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}

async function sendInitialThreadMessage(createThreadRequestJSON, requestHelpConfig) {
  const embedColor = 15833771;

  const messageComponents = {
    'content': requestHelpConfig.initialThreadMessage,
  };

  const componentObject = [
    {
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.PRIMARY,
          'label': 'Delete Thread',
          'custom_id': 'deletethread',
        },
      ],
    },
  ];

  const threadEmbedJSON = await sendMessage(createThreadRequestJSON.id, { messageComponents, componentObject });

  return threadEmbedJSON;
}


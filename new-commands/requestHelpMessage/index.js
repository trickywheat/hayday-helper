import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
// import { installSlashCommand } from '../installSlashCommands.js';
import { createThread, inviteGuildMemberToThread, invokeLambda, getRequestTypeConfig, sendMessage, resolveDeferredToken } from '../utilities.js';

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

  const { application_id: applicationId, token: requestToken, guild_id: guildId } = requestJSON;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const requestType = requestJSON.data.components[0].components[0].custom_id.split('.')[1];
  const requestHelpMessage = requestJSON.data.components[0].components[0].value;

  const requestHelpConfig = await getRequestTypeConfig(guildId, requestType);

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
  const targetChannel = requestTypeObject.targetChannel;
  const embedColor = requestTypeObject?.colors?.requestOpen || 0;

  const messageObject = {
    'embeds': [{
      'title': `Request: ${requestTypeObject.label}`,
      'description': requestHelpMessage,
      'color': embedColor,
      'footer': {
        'text': `Requested by ${guildMember}`,
      },
    }],
  };

  const postEmbedRequestJSON = await sendMessage(targetChannel, messageObject);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}

async function sendInitialThreadMessage(createThreadRequestJSON, requestHelpConfig) {
  const messageObject = {
    'content': requestHelpConfig.initialThreadMessage,
    'embeds': requestHelpConfig.embeds,
    'components': [{
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.PRIMARY,
          'label': 'Delete Thread',
          'custom_id': 'deletethread',
        },
      ],
    }],
  };

  const threadEmbedJSON = await sendMessage(createThreadRequestJSON.id, messageObject);

  return threadEmbedJSON;
}


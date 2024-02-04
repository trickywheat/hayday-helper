import { discordConstants } from '../../discordConsts.js';
import { resolveDeferredToken, getChannelInformation, getRequestMessageContents, sendPayloadToDiscord, sendMessage, getRequestTypeConfig } from '../../utilities.js';

const discordSlashMetadata = {
  'name': 'blossomderby.400points',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
};

export { discordSlashMetadata };

export async function execute(requestJSON, lambdaEvent, lambdaContext) {
  console.log(discordSlashMetadata.name + ' - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, channel_id: threadChannelId, guild_id: guildId } = requestJSON;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;

  const requestHelpConfig = await getRequestTypeConfig(guildId, 'blossomderby.createtask');
  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to modify this thread.  It might be a thread I am not permitted to edit.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);

    return responseJson;
  }

  const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);

  // If the message contains embeds and does NOT contain 400, do it.
  if (messageContentsJSON?.embeds[0].title.includes('400 POINTS!'))
    await resolveDeferredToken(applicationId, requestToken, 'This task has already been marked with 400 points.');
  else
    await editInitialMessageEmbed(messageContentsJSON, guildMember);

  await disableButton(requestJSON.message, discordSlashMetadata.name);

  await sendMessage(requestHelpConfig['400announcementChannel'], { 'content': `<@&${requestHelpConfig.derbyRoleId}>: **${messageContentsJSON?.embeds[0].title}** is 400 points!  If you haven't already joined the queue and are interested in completing the task, head over to the thread: <#${threadChannelId}>` });

  await resolveDeferredToken(applicationId, requestToken, 'Task updated.  You may close this message at anytime.');

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON) {
  const { channel_id: channelId, id: messageId, embeds: [ messageEmbed ] } = messageContentsJSON;

  const payloadEmbed = { ...messageEmbed };
  payloadEmbed.title += ' 400 POINTS!';

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const payloadJSON = {
    'embeds': [payloadEmbed],
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

async function disableButton(messageContentsJSON, customIdToDisable) {
  const { id: messageId, channel_id: channelId } = messageContentsJSON;

  const updatedMessageObject = {
    'components': [ ...messageContentsJSON.components ],
    'embeds': [ ...messageContentsJSON.embeds ],
  };

  // disable the secondtask button
  updatedMessageObject.components[1].components = messageContentsJSON.components[1].components.map((i) => {
    if (i.custom_id == customIdToDisable) i.disabled = true;
    return i;
  });

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  console.log(`Send message with ${customIdToDisable} button: ` + JSON.stringify(updatedMessageObject));
  const discordResponse = await sendPayloadToDiscord(url, updatedMessageObject, 'patch');

  return discordResponse;
}

import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { readJSONFile, sendMessage, createThread, inviteGuildMemberToThread, resolveDeferredToken, getChannelInformation, getRequestMessageContents, sendPayloadToDiscord } from '../../utilities.js';

export const discordSlashMetadata = {
  'name': 'blossomderby.400points',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
};

export async function execute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('blossomderby.400points - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, channel_id: threadChannelId } = requestJSON;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;

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

  // await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  // await resolveDeferredToken(applicationId, requestToken, `Your request thread has been created: <#${initialThreadMessageJSON.channel_id}>  You may dismiss this message at anytime.`);

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON) {
  const { channel_id: channelId, id: messageId, embeds: messageEmbed } = messageContentsJSON;

  messageEmbed[0].title += ' 400 POINTS!';

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

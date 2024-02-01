import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { readJSONFile, sendMessage, createThread, inviteGuildMemberToThread, resolveDeferredToken, getChannelInformation, getRequestMessageContents, sendPayloadToDiscord } from '../../utilities.js';

export const discordSlashMetadata = {
  'name': 'blossomderby.togglemember',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
};

export async function execute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('blossomderby.togglemember - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, channel_id: threadChannelId } = requestJSON;
  const guildMemberObject = requestJSON.member;

  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to modify this thread.  It might be a thread I am not permitted to edit.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);

    return responseJson;
  }

  const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);
  const editMessageResponseJSON = await editInitialMessageEmbed(messageContentsJSON, guildMemberObject);

  // await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  await resolveDeferredToken(applicationId, requestToken, 'You have been added to the queue!');

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON, guildMemberObject) {
  const { channel_id: channelId, id: messageId, embeds: messageEmbed } = messageContentsJSON;

  const guildMember = guildMemberObject.nick || guildMemberObject.user.username;

  const queue = messageEmbed[0].fields.find(i => i.name == 'Queue:');
  const completed = messageEmbed[0].fields.find(i => i.name == 'Completed:');

  if (!queue.value.includes(guildMember)) {
    queue.value = (queue.value == '(none)' ? guildMember : queue.value + '\n' + guildMember);
  } else {
    queue.value = queue.value.replace(guildMember, '');
    if (queue.value.trim().length == 0) queue.value = '(none)';
    console.log('queue: ' + queue);
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';
import { deleteThread, getChannelInformation, getRequestMessageContents, invokeLambda, readJSONFile, resolveDeferredToken, sendPayloadToDiscord } from '../utilities.js';

export { discordSlashMetadata };

export async function execute(_requestJSON, lambdaEvent, lambdaContext) {
  const responseJson = await invokeLambda(lambdaEvent, lambdaContext);

  return responseJson;
}

// Since this is executed by Lambda, a Discord-type response is not needed,
// but let's follow the convention
export async function callbackExecute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('blossomderby - callbackExecute');

  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaContext.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const threadChannelId = requestJSON.channel_id;
  const applicationId = requestJSON.application_id;
  const requestToken = requestJSON.token;

  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to delete this thread.  It might be a thread I am not permitted to delete.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);
  } else {
    const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);

    // If the message contains embeds, it's the initial message sent.  Edit the message
    if (Object.prototype.hasOwnProperty.call(messageContentsJSON, 'embeds'))
      await editInitialMessageEmbed(messageContentsJSON, guildMember);

    // Finally, delete the thread
    await deleteThread(threadChannelId);
  }

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON, guildMember) {
  const serverConfig = await readJSONFile('./serverConfig.json');
  const { embeds: messageEmbed } = messageContentsJSON;

  messageEmbed[0].title += ' -- FULFILLED!';
  messageEmbed[0].color = serverConfig[messageContentsJSON.thread.guild_id].colors.requestClose || 0;
  messageEmbed[0].footer.text += ' -- Thread closed by ' + guildMember;

  const url = `https://discord.com/api/v10/channels/${messageContentsJSON.channel_id}/messages/${messageContentsJSON.id}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

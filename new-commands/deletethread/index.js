import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';
import { deleteRole, deleteThread, getChannelInformation, getRequestMessageContents, getRequestTypeConfig, invokeLambda, resolveDeferredToken, sendPayloadToDiscord } from '../utilities.js';

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

  const { application_id: applicationId, token: requestToken, channel_id: threadChannelId, guild_id: guildId } = requestJSON;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;

  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to delete this thread.  It might be a thread I am not permitted to delete.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);
  } else {
    const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);

    // If the message contains embeds, it's the initial message sent.  Edit the message
    if (messageContentsJSON?.embeds) {
      if (messageContentsJSON.embeds[0]?.footer?.text.includes('roleId:')) {
        const roleId = messageContentsJSON.embeds[0]?.footer?.text.split(':')[1].trim();
        await deleteRole(guildId, roleId);
      }

      await editInitialMessageEmbed(messageContentsJSON, guildMember);
    }

    // Finally, delete the thread
    await deleteThread(threadChannelId);
  }

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON, guildMember) {
  const { channel_id: channelId, id: messageId, embeds: messageEmbed, thread: { guild_id: guildId } } = messageContentsJSON;

  const requestLabel = messageEmbed[0].title.split(':')[1].trim();
  const requestTypeConfig = await getRequestTypeConfig(guildId, requestLabel);

  messageEmbed[0].title += ' -- FULFILLED!';
  messageEmbed[0].color = requestTypeConfig?.colors?.requestClose || 0;
  messageEmbed[0].footer.text += ' -- Thread closed by ' + guildMember;

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message...');
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
  return discordResponse;
}

if (process.env.INSTALL_COMMAND) {
  install().then((discordResponse) => {
    console.log(`Command ${discordResponse.name} installed on Guild ${discordResponse.guild_id} with id ${discordResponse.id}`);
  });
}

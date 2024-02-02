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
  let subcommandValue = requestJSON?.data?.options?.[0].name || requestJSON.data.name || requestJSON.data.custom_id;

  // command schema:
  //   blossomderby.togglemember_<roleId>_<cherryblossom|blossom>
  // Remove 'blossomderby.'
  subcommandValue = subcommandValue.split('.')[1];

  const [ subcommandName, roleId, blossomFlower ] = subcommandValue.split('_');

  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to modify this thread.  It might be a thread I am not permitted to edit.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);

    return responseJson;
  }

  const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);
  const editMessageResponseJSON = await editInitialMessageEmbed(messageContentsJSON, guildMemberObject, blossomFlower);

  // await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  await resolveDeferredToken(applicationId, requestToken, 'You have been added to the queue!');

  return responseJson;
}

async function editInitialMessageEmbed(messageContentsJSON, guildMemberObject, blossomFlower) {
  const { channel_id: channelId, id: messageId, embeds: messageEmbed } = messageContentsJSON;

  const guildMember = guildMemberObject.nick || guildMemberObject.user.username;

  const queue = messageEmbed[0].fields.find(i => i.name == 'Queue:');
  const completed = messageEmbed[0].fields.find(i => i.name == 'Completed:');

  const blossomEmoji = (blossomFlower == 'cherryblossom' ? '🌸' : (blossomFlower == 'blossom' ? '🌼' : '❓'));

  if (isGuildMemberEmojiInThisList(queue.value, guildMember, blossomEmoji)) {
    console.log('guildMember in queue');
    queue.value = removeFromList(queue.value, guildMember, blossomEmoji);
    completed.value = addToList(completed.value, guildMember, blossomEmoji);
  } else {
    console.log('guildMember NOT in queue');
    queue.value = addToList(queue.value, guildMember, blossomEmoji);
    completed.value = removeFromList(completed.value, guildMember, blossomEmoji);
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const payloadJSON = {
    'embeds': messageEmbed,
  };

  console.log('Send edited initial embedded message: ' + JSON.stringify(payloadJSON));
  const editMessageResponseJSON = await sendPayloadToDiscord(url, payloadJSON, 'patch');
  return editMessageResponseJSON;
}

function isGuildMemberEmojiInThisList(queueListText, guildMember, blossomEmoji) {
  const re = new RegExp(`^${guildMember}.*$`, 'm');
  const matchedLine = queueListText.match(re)?.[0];

  if (!matchedLine) {
    console.log('matchedLine is false!!  Returning False');
    // If the match is undefined, it means it does not contain the
    // guildMember.  Return false;
    return false;
  }

  const matchedLineParts = matchedLine.split(' ');

  // Matching on the blossomEmoji implicitly means
  // a match on the guildMember as well
  if (matchedLineParts.includes(blossomEmoji))
    return true;

  return false;
}

function removeFromList(queueListText, guildMember, blossomEmoji) {
  let returnListText = null;
  const re = new RegExp(`^${guildMember}.*$`, 'm');
  const matchedLine = queueListText.match(re)?.[0];
  console.log('matchedLine: ' + matchedLine);

  if (!matchedLine) {
    // If the match is undefined, it means it does not contain the
    // guildMember.  Return null.
    return queueListText;
  }

  const matchedLineParts = matchedLine.split(' ');

  // Matching on the blossomEmoji implicitly means
  // a match on the guildMember as well
  if (matchedLineParts.includes(blossomEmoji)) {
    if (matchedLineParts.length > 2) {
      const remainingParts = matchedLineParts.filter(i => i != blossomEmoji);
      returnListText = queueListText.replace(matchedLine, remainingParts.join(' ') + '\n');
    } else {
      returnListText = queueListText.replace(matchedLine, '');
    }

    if (returnListText.trim().length == 0)
      returnListText = '(none)';
  } else {
    // the list does not contain the guildMember and emoji,
    // there is nothing to remove.  Return null.
    returnListText = queueListText;
  }

  return returnListText;
}

function addToList(queueListText, guildMember, blossomEmoji) {
  let returnListText = null;
  const re = new RegExp(`^${guildMember}.*$`, 'm');
  const matchedLine = queueListText.match(re)?.[0];
  console.log('matchedLine: ' + matchedLine);

  if (!matchedLine) {
    // If the match is undefined, it means guildMember isn't in the list
    // at all.  Add them
    const newMemberLine = [guildMember, blossomEmoji].join(' ');
    returnListText = (queueListText == '(none)' ? newMemberLine : queueListText + '\n' + newMemberLine);
  } else {
    const matchedLineParts = matchedLine.split(' ');
    if (matchedLineParts.includes(blossomEmoji)) {
      // If the list contains the guildMember and the emoji
      // there is nothing to add.  Return as-is.
      return queueListText;
    } else if (matchedLineParts.length >= 2) {
      // If the list contains the guildMember but the length
      // of the split is >= 2, it means that other emojis is there
      // and this emoji should be added
      returnListText = queueListText.replace(matchedLine, [ ...matchedLineParts, blossomEmoji].join(' '));
    }
  }

  return returnListText;
}

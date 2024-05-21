import { discordConstants } from '../../discordConsts.js';
import { inviteGuildMemberToThread, resolveDeferredToken, getChannelInformation, getRequestMessageContents, sendPayloadToDiscord } from '../../utilities.js';

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

  const { application_id: applicationId, token: requestToken, channel_id: threadChannelId, guild_id: guildId } = requestJSON;
  const guildMemberObject = requestJSON.member;
  let subcommandValue = requestJSON?.data?.options?.[0].name || requestJSON.data.name || requestJSON.data.custom_id;

  // command schema:
  //   blossomderby.togglemember_<roleId>_<cherryblossom|blossom>
  // Remove 'blossomderby.'
  subcommandValue = subcommandValue.split('.')[1];

  const [ , roleId, blossomFlower ] = subcommandValue.split('_');

  const threadChannelInfoJSON = await getChannelInformation(threadChannelId);

  // Bot must own the thread and the thread must be public
  if ((threadChannelInfoJSON.owner_id != process.env.DISCORD_BOT_APP_ID) ||
  (threadChannelInfoJSON.type != discordConstants.channelTypes.PUBLIC_THREAD)) {
    await resolveDeferredToken(applicationId, requestToken, `Unable to modify this thread.  It might be a thread I am not permitted to edit.  If you think you are getting this in error, please tell my developer.  requestId: \`${lambdaContext.awsRequestId}\``);

    return responseJson;
  }

  const messageContentsJSON = await getRequestMessageContents(threadChannelInfoJSON.parent_id, threadChannelId);
  const editMessageResponseJSON = await editInitialMessageEmbed(messageContentsJSON, guildMemberObject, blossomFlower);

  const queue = editMessageResponseJSON.embeds[0].fields.find(i => i.name == 'Queue:');
  const guildMember = guildMemberObject.nick || guildMemberObject.user.username;

  if (queue.value.includes(guildMember)) {
    console.log('Inviting to thread and adding role...');
    await inviteGuildMemberToThread(threadChannelId, guildMemberObject.user.id);
    await toggleRole('add', guildId, guildMemberObject.user.id, roleId);
  } else {
    console.log('Removing role...');
    await toggleRole('remove', guildId, guildMemberObject.user.id, roleId);
  }

  await resolveDeferredToken(applicationId, requestToken, 'Task updated.  You may close this message at anytime.');

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
  console.log('removedFromList - matchedLine: ' + matchedLine);

  if (!matchedLine) {
    // If the match is undefined, it means it does not contain the
    // guildMember.  Return null.
    return queueListText;
  }

  // Remove the guildMember, trim the remaining string, then split by spaces.
  // This will leave only the emojis in an array.
  const blossomEmojiArray = matchedLine.slice(guildMember.length).trim().split(' ');

  // Matching on the blossomEmoji implicitly means
  // a match on the guildMember as well
  if (blossomEmojiArray.includes(blossomEmoji)) {
    if (blossomEmojiArray.length > 1) {
      const remainingEmojis = blossomEmojiArray.filter(i => i != blossomEmoji);
      returnListText = queueListText.replace(matchedLine, guildMember + ' ' + remainingEmojis.join(' ') + '\n');
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

  returnListText = removeNewLines(removeFromList);  
  return returnListText;
}

function addToList(queueListText, guildMember, blossomEmoji) {
  let returnListText = null;
  const re = new RegExp(`^${guildMember}.*$`, 'm');
  const matchedLine = queueListText.match(re)?.[0];
  console.log('addToList - matchedLine: ' + matchedLine);

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

  returnListText = removeNewLines(removeFromList);  
  return returnListText;
}

async function toggleRole(action, guildId, guildMemberId, roleId) {
  const url = `https://discord.com/api/v10/guilds/${guildId}/members/${guildMemberId}/roles/${roleId}`;
  const method = (action == 'add' ? 'put' : 'delete');

  const discordResponse = await sendPayloadToDiscord(url, {}, method);
  return discordResponse;
}

function removeNewLines(text) {
  let returnText = text;
  console.log('blossom.derby.togglemember.removeNewLines - ' + returnText);
  
  // remove newlines
  while (returnText.indexOf('\n\n') > -1) {
    returnText = returnText.replace('\n\n', '\n');    
  }

  return returnText;
}
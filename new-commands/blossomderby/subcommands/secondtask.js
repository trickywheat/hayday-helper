import { discordConstants } from '../../discordConsts.js';
import { resolveDeferredToken, sendPayloadToDiscord } from '../../utilities.js';

const discordSlashMetadata = {
  'name': 'blossomderby.secondtask',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
};

export { discordSlashMetadata };

export async function execute(requestJSON, lambdaEvent) {
  console.log(discordSlashMetadata.name + ' - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, message: messageContentsJSON } = requestJSON;
  const { id: messageId, channel_id: channelId } = messageContentsJSON;

  const updatedMessageObject = {
    'components': [ ...messageContentsJSON.components ],
    'embeds': [ ...messageContentsJSON.embeds ],
  };

  // add the task button
  const newBlossomButton = { ...messageContentsJSON.components[0].components[0] };
  newBlossomButton.emoji = { 'name': '🌼' };
  newBlossomButton.custom_id = newBlossomButton.custom_id.replace('cherryblossom', 'blossom');
  updatedMessageObject.components[0].components.push(newBlossomButton);

  // disable the secondtask button
  updatedMessageObject.components[1].components = messageContentsJSON.components[1].components.map((i) => {
    if (i.custom_id == discordSlashMetadata.name) i.disabled = true;
    return i;
  });

  messageContentsJSON.embeds[0].description += '\n\n**Second Task Dropped!  🌼**\n\nA second copy of the this thread\'s is on the board!  If you have completed the first copy and want to complete the second, press the 🌼 button to be added to the queue.  If you still have both tasks outstanding, prioritize the one that will expire first.  But don\'t feel like you need to wait.';

  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  console.log('Send edited initial embedded message: ' + JSON.stringify(updatedMessageObject));
  await sendPayloadToDiscord(url, updatedMessageObject, 'patch');

  await resolveDeferredToken(applicationId, requestToken, 'Task updated.  You may close this message at anytime.');

  return responseJson;
}


sendPayloadToDiscord()import { discordConstants } from '../../discordConsts.js';
import { sendMessage, createThread, inviteGuildMemberToThread, resolveDeferredToken, sendPayloadToDiscord, getRequestTypeConfig } from '../../utilities.js';

export const discordSlashMetadata = {
  'name': 'blossomderby.createtask',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
};

export async function execute(requestJSON, lambdaEvent, _lambdaContext) {
  console.log('blossomderby.createtask - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const { application_id: applicationId, token: requestToken, guild_id: guildId } = requestJSON;
  const taskOptions = { ...requestJSON.data.options[0] };

  const requestHelpConfig = await getRequestTypeConfig(guildId, 'blossomderby.createtask');

  // Create the temporary role
  const createRoleJSON = await createBlossomDerbyRole(guildId, taskOptions);

  // Build embed for the request channel
  const postEmbedRequestJSON = await buildRequestEmbed(requestJSON, requestHelpConfig, createRoleJSON.id);

  // Create the Thread
  const createThreadRequestJSON = await createThread(postEmbedRequestJSON.channel_id, postEmbedRequestJSON.id, postEmbedRequestJSON.embeds[0].title);

  await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  // Build the embed for the thread
  const initialThreadMessageJSON = await buildThreadEmbed(createThreadRequestJSON, requestHelpConfig, createRoleJSON, taskOptions);

  await resolveDeferredToken(applicationId, requestToken, `Your request thread has been created: <#${initialThreadMessageJSON.channel_id}>  You may dismiss this message at anytime.`);

  return responseJson;
}

async function buildRequestEmbed(requestJSON, requestHelpConfig, roleId) {
  // Get the JSON for the specific command
  const taskOptions = requestJSON.data.options[0];
  const taskName = taskOptions.options.find((i) => i.name == 'taskname').value;

  // If the specific choice channel is specified, then use that channel.  If not, use all.
  const targetChannel = requestHelpConfig.targetChannel;
  const embedColor = requestHelpConfig.colors.requestOpen || 0;

  const messageObject = {
    'embeds': [{
      'title': `${requestHelpConfig.requestEmbed.title}: ${taskName}`,
      'color': embedColor,
      'fields': [
        {
          'name': 'Queue:',
          'value': '(none)',
        },
        {
          'name': 'Completed:',
          'value': '(none)',
        },
      ],
      'footer': {
        'text': `roleId: ${roleId}`,
      },
    }],
  };

  const postEmbedRequestJSON = await sendMessage(targetChannel, messageObject);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}

async function buildThreadEmbed(createThreadRequestJSON, requestHelpConfig, createRoleJSON, taskOptions) {
  const threadEmbed = requestHelpConfig.requestHelpMessage;

  const messageObject = {
    embeds: [{
      'title': threadEmbed.title,
      'description': threadEmbed.description,
      'color': threadEmbed.color,
      'footer': {
        'text': `Blossom Task Role: @${createRoleJSON.name}`,
      },
    }],
    components: [{
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.PRIMARY,
          'custom_id': `blossomderby.togglemember_${createRoleJSON.id}_cherryblossom`,
          'emoji': {
            'id': null,
            'name': '🌸',
          },
        },
      ],
    },
    {
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.PRIMARY,
          'label': '400 Points!',
          'custom_id': 'blossomderby.400points',
        },
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.SECONDARY,
          'label': 'Add Second Task',
          'custom_id': 'blossomderby.secondtask',
        },
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.DANGER,
          'label': 'Delete Thread',
          'custom_id': 'deletethread',
        },
      ],
    }],
  };

  if (taskOptions.options.find(i => (i.name == 'pingderby') && (i.value == true))) {
    // Update this to ping the derby role
    messageObject.content = `<@&${requestHelpConfig.derbyRoleId}>!`;
    messageObject.embeds[0].description += '\n\n**Derby Ping!!**  This is a fast-task!  Everyone with the 🏇 Derby role is being pinged so that everyone can be ready to finish it.  Please follow the instructions above to add yourself to the queue.';
  }

  const threadEmbedJSON = await sendMessage(createThreadRequestJSON.id, messageObject);
  return threadEmbedJSON;
}

async function createBlossomDerbyRole(guildId, taskOptions) {
  const url = `https://discord.com/api/v10/guilds/${guildId}/roles`;

  // Generate random string https://stackoverflow.com/a/8084248
  const r = (Math.random() + 1).toString(36).substring(6);
  const taskName = taskOptions.options.find((i) => i.name == 'taskname').value;

  const payloadJSON = {
    'name': `🌸 ${taskName} - ${r}`,
    'mentionable': true,
  };

  console.log('Creating role: ' + JSON.stringify(payloadJSON));
  const roleResponse = await sendPayloadToDiscord(url, payloadJSON, 'post');
  return roleResponse;
}

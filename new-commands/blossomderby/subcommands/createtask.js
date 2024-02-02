import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { readJSONFile, sendMessage, createThread, inviteGuildMemberToThread, resolveDeferredToken, sendPayloadToDiscord } from '../../utilities.js';

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
  const requestHelpMessageObject = commandMetadata.config.createtask.requestEmbed;

  // Create the temporary role
  const createRoleJSON = await createBlossomDerbyRole(guildId, taskOptions);

  // Build embed for the request channel
  const postEmbedRequestJSON = await buildRequestEmbed(requestJSON, requestHelpMessageObject, createRoleJSON.id);

  // Create the Thread
  const createThreadRequestJSON = await createThread(postEmbedRequestJSON.channel_id, postEmbedRequestJSON.id, postEmbedRequestJSON.embeds[0].title);

  await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  // Build the embed for the thread
  const threadEmbed = commandMetadata.config.createtask.requestHelpMessage;
  const initialThreadMessageJSON = await buildThreadEmbed(createThreadRequestJSON, threadEmbed, createRoleJSON);

  await resolveDeferredToken(applicationId, requestToken, `Your request thread has been created: <#${initialThreadMessageJSON.channel_id}>  You may dismiss this message at anytime.`);

  return responseJson;
}

async function buildRequestEmbed(requestJSON, requestHelpMessageObject, roleId) {
  const { guild_id: guildId } = requestJSON;
  const serverConfig = await readJSONFile(`./config/${guildId}.json`);

  // Get the JSON for the specific command
  const taskOptions = requestJSON.data.options[0];
  const taskName = taskOptions.options.find((i) => i.name == 'tasktitle').value;

  // If the specific choice channel is specified, then use that channel.  If not, use all.
  const requestTypeObject = serverConfig.requestTypes.find((i) => i.value == 'helptask') || serverConfig.requestTypes.find((i) => i.value == 'generalrequest');
  const targetChannel = (requestTypeObject ? requestTypeObject.targetChannel : null);
  const embedColor = serverConfig.requestMeta.colors.requestOpen || 0;

  const messageObject = {
    'embeds': [{
      'title': `${requestHelpMessageObject.title}: ${taskName}`,
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

async function buildThreadEmbed(createThreadRequestJSON, threadEmbed, createRoleJSON) {
  // light pink from the blossom flower
  const embedColor = 15833771;

  const messageObject = {
    embeds: [{
      'title': threadEmbed.title,
      'description': threadEmbed.description,
      'color': embedColor,
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
          'label': 'Give Final Warning',
          'custom_id': 'blossomderby.finalwarning',
        },
      ],
    }],
  };

  const threadEmbedJSON = await sendMessage(createThreadRequestJSON.id, messageObject);

  return threadEmbedJSON;
}

async function createBlossomDerbyRole(guildId, taskOptions) {
  const url = `https://discord.com/api/v10/guilds/${guildId}/roles`;

  // Generate random string https://stackoverflow.com/a/8084248
  const r = (Math.random() + 1).toString(36).substring(6);
  const taskName = taskOptions.options.find((i) => i.name == 'tasktitle').value;

  const payloadJSON = {
    'name': `🌸 ${taskName} - ${r}`,
    'mentionable': true,
  };

  console.log('Creating role: ' + JSON.stringify(payloadJSON));
  const roleResponse = await sendPayloadToDiscord(url, payloadJSON, 'post');
  return roleResponse;
}

import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { readJSONFile, sendRequestEmbed, createThread, inviteGuildMemberToThread, resolveDeferredToken, addReaction } from '../../utilities.js';

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

  const requestHelpMessageObject = commandMetadata.config.createtask.requestEmbed;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const applicationId = requestJSON.application_id;
  const requestToken = requestJSON.token;

  // Build embed for the request channel
  const postEmbedRequestJSON = await buildRequestEmbed(requestJSON, guildMember, requestHelpMessageObject);

  // Create the Thread
  const createThreadRequestJSON = await createThread(postEmbedRequestJSON.channel_id, postEmbedRequestJSON.id, postEmbedRequestJSON.embeds[0].title);

  await inviteGuildMemberToThread(createThreadRequestJSON.id, requestJSON.member.user.id);

  // Build the embed for the thread
  const threadEmbed = commandMetadata.config.createtask.requestHelpMessage;
  const initialThreadMessageJSON = await buildThreadEmbed(createThreadRequestJSON, threadEmbed);

  await addReaction(initialThreadMessageJSON.channel_id, initialThreadMessageJSON.id, '🌸');

  await resolveDeferredToken(applicationId, requestToken, `Your request thread has been created: <#${initialThreadMessageJSON.channel_id}>  You may dismiss this message at anytime.`);

  return responseJson;
}

async function buildRequestEmbed(requestJSON, guildMember, requestHelpMessageObject) {
  const serverConfig = await readJSONFile('./serverConfig.json');

  // Get the JSON for the specific command
  const taskOptions = requestJSON.data.options[0];
  console.log(JSON.stringify(taskOptions));
  const taskName = taskOptions.options.find((i) => i.name == 'tasktitle').value;

  // If the specific choice channel is specified, then use that channel.  If not, use all.
  const targetChannel = serverConfig[requestJSON.guild_id].requestChannels.helptask || serverConfig[requestJSON.guild_id].requestChannels.all;
  const embedColor = serverConfig[requestJSON.guild_id].colors.requestOpen || 0;

  const embedObject = {
    'title': `${requestHelpMessageObject.title} - ${taskName}`,
    'description': `${requestHelpMessageObject.description}`,
    'color': embedColor,
    'footer': {
      'text': `Requested by ${guildMember}`,
    },
  };

  const postEmbedRequestJSON = await sendRequestEmbed(targetChannel, { embedObject });
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}

async function buildThreadEmbed(createThreadRequestJSON, threadEmbed) {
  // light pink from the blossom flower
  const embedColor = 15833771;

  const embedObject = {
    'title': threadEmbed.title,
    'description': threadEmbed.description,
    'color': embedColor,
  };

  const componentObject = [
    {
      'type': discordConstants.componentType.ACTION_ROW,
      'components': [
        {
          'type': discordConstants.componentType.BUTTON,
          'style': discordConstants.buttonStyle.PRIMARY,
          'custom_id': 'blossomderby.togglemember',
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
    },
  ];

  const threadEmbedJSON = await sendRequestEmbed(createThreadRequestJSON.id, { embedObject, componentObject });

  return threadEmbedJSON;
}


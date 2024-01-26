import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { sendPayloadToDiscord } from '../../utilities.js';

export const discordSlashMetadata = {
  'name': 'blossomderby.createtask',
  'type': 'SUB_COMMAND',
  'description': 'Create Blossom Derby-focused tasks.',
}

export async function execute(requestJSON, lambdaEvent, lambdaContext) {
  console.log('blossomderby.createtask - execute');
  // Ephemeral message -- viewable by invoker only
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'Lambda callback executed.  requestId `' + lambdaEvent.awsRequestId + '`',
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };

  const requestEmbed = commandMetadata.config.createtask.requestEmbed;
  const requestHelpMessageObject = commandMetadata.config.createtask.requestEmbed;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const _applicationId = requestJSON.application_id;
  const _requestToken = requestJSON.token;

  // Build embed for the request channel
  const postEmbedRequestJSON = await sendRequestEmbed(requestJSON, guildMember, requestHelpMessageObject);

  return responseJson;
}

async function sendRequestEmbed(requestJSON, guildMember, requestHelpMessageObject) {
  const { default: serverConfig } = await import('../../serverConfig.json', { with: { type: 'json' }});

  // Get the JSON for the specific command
  const taskOptions = requestJSON.data.options[0];
  console.log(JSON.stringify(taskOptions));
  const taskName = taskOptions.options.find((i) => i.name == 'tasktitle').value;

  // If the specific choice channel is specified, then use that channel.  If not, use all.
  const targetChannel = serverConfig[requestJSON.guild_id].requestChannels.helptask || serverConfig[requestJSON.guild_id].requestChannels.all;
  const url = `https://discord.com/api/v10/channels/${targetChannel}/messages`;
  const messageComponents = {
    'embeds': [
      {
        'title': `${requestHelpMessageObject.title} - ${taskName}`,
        'description': `${requestHelpMessageObject.description}`,
        'color': 0x00f721,
        'footer': {
          'text': `Requested by ${guildMember}`,
        },
      },
    ],
  };

  console.log('Sending post embed: ' + JSON.stringify(messageComponents));
  const postEmbedRequestJSON = await sendPayloadToDiscord(url, messageComponents);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}


import { discordConstants } from '../../discordConsts.js';
import { discordSlashMetadata as commandMetadata } from '../commandMetadata.js';
import { readJSONFile, sendRequestEmbed } from '../../utilities.js';

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

  const requestHelpMessageObject = commandMetadata.config.createtask.requestEmbed;
  const guildMember = requestJSON.member.nick || requestJSON.member.user.username;
  const _applicationId = requestJSON.application_id;
  const _requestToken = requestJSON.token;

  // Build embed for the request channel
  const postEmbedRequestJSON = await buildRequestEmbed(requestJSON, guildMember, requestHelpMessageObject);

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

  const postEmbedRequestJSON = await sendRequestEmbed(targetChannel, embedObject);
  console.log(postEmbedRequestJSON);

  return postEmbedRequestJSON;
}


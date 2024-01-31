import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';
import { invokeLambda, loadModule } from '../utilities.js';

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

  let subcommandName = requestJSON?.data?.options?.[0].name || requestJSON.data.name || requestJSON.data.custom_id;
  if (subcommandName.split('.').length > 1)
    subcommandName = subcommandName.split('.')[1];

  console.log('blossomderby.callbackExecute - subcommandName: ' + subcommandName);

  const subcommandModule = await loadModule(subcommandName, 'blossomderby/subcommands/');
  const executeResponse = await subcommandModule.execute(requestJSON, lambdaEvent, lambdaContext);
  console.log(JSON.stringify(executeResponse));

  return responseJson;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
}

if (process.env.INSTALL_COMMAND) {
  install().then(() => {
    console.log(`Command ${discordSlashMetadata.name} installed.`);
  });
}

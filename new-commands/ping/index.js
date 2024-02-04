import { installSlashCommand } from '../installSlashCommands.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { discordConstants } from '../discordConsts.js';
export { discordSlashMetadata };

export function execute() {
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'content': 'PONG!',
    },
  };

  return responseJson;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
}

if (process.env.INSTALL_COMMAND) {
  install().then((discordResponse) => {
    console.log(`Command ${discordResponse.name} installed on Guild ${discordResponse.guild_id} with id ${discordResponse.id}`);
  });
}

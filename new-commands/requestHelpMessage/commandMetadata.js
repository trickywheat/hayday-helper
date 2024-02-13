import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'requestHelpMessage',
  'type': discordConstants.applicationCommandType.COMMAND_RESPONSE,
  'description': 'Processes modal response message provided by the requester and creates a corresponding thread.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.COMMAND_RESPONSE,
};

export { discordSlashMetadata };

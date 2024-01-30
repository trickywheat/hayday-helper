import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'requestHelpMessage',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Processes help message provided by a user by creating a thread.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
};

export { discordSlashMetadata };

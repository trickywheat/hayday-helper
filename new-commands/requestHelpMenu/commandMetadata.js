import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'requestHelpMenu',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Creates a help request.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
};

export { discordSlashMetadata };

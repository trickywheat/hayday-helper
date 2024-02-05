import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'about',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Gives you information about the bot.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
};

export { discordSlashMetadata };

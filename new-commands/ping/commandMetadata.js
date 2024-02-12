import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'ping',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'ping!  Replies with pong.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
};

export { discordSlashMetadata };

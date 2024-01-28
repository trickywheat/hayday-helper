import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'deletethread',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Deletes a Request Thread; Must be used in the thread to be deleted.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
};

export { discordSlashMetadata };

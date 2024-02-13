import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'requestHelpMenu',
  'type': discordConstants.applicationCommandType.COMMAND_RESPONSE,
  'description': 'Responses to the request menu by processing the request type and then presenting a modal for the requester to provide their request text.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.COMMAND_RESPONSE,
};

export { discordSlashMetadata };

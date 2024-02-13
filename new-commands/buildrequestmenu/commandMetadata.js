import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'buildrequestmenu',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Builds the request menu that users interact with.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'options': [
    {
      'name': 'targetchannel',
      'description': 'Which channel to post in.  Defaults to current channel.',
      'type': discordConstants.applicationCommandOptionType.CHANNEL,
      'required': false,
    },
  ],
};

export { discordSlashMetadata };

import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'setupderby',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Sets up the next derby',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'options': [
    {
      'name': 'derbytype',
      'description': 'The type of derby',
      'type': discordConstants.applicationCommandOptionType.STRING,
      'required': true,
      'choices': [
        {
          'name': 'Normal',
          'value': 'derby_normal',
        },
        {
          'name': 'Blossom',
          'value': 'derby_blossom',
        },
      ],
    },
  ],
};

export { discordSlashMetadata };
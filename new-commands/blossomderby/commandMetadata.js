import { discordConstants } from '../discordConsts.js';

const discordSlashMetadata = {
  'name': 'blossomderby',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Commands that help manage blossom derby-specific tasks.',
};

discordSlashMetadata.commandMetadata = {
  'name': discordSlashMetadata.name,
  'description': discordSlashMetadata.description,
  'options': [
    {
      'name': 'task',
      'description': 'Blossom Task related commands',
      'type': discordConstants.applicationCommandOptionType.SUB_COMMAND_GROUP,
      'options': [
        {
          'name': 'create',
          'description': 'Create a Blossom Task thread',
          'type': discordConstants.applicationCommandOptionType.SUB_COMMAND,
          'options': [
            {
              'name': 'tasktitle',
              'description': 'Derby Task Title (e.g. Wheat, Mining, Townie)',
              'type': discordConstants.applicationCommandOptionType.STRING,
              'required': true,
            },
            {
              'name': 'pingderby',
              'description': 'Set to true to ping derby participants immediately',
              'type': discordConstants.applicationCommandOptionType.BOOLEAN,
              'required': false,
            },
          ],
        },
        {
          'name': '400points',
          'description': 'Mark an existing task thread as 400 points and ping remaining derby participants',
          'type': discordConstants.applicationCommandOptionType.SUB_COMMAND,
        },
        {
          'name': 'secondtask',
          'description': 'Add a second reaction to an existing thread (i.e. two wheat blossom tasks)',
          'type': discordConstants.applicationCommandOptionType.SUB_COMMAND,
        },
      ],
    },
  ],
};

export { discordSlashMetadata };

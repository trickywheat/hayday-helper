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
      'name': 'createtask',
      'description': 'Blossom Task related commands',
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
};

discordSlashMetadata.config = {
  'createtask': {
    'requestEmbed': {
      'title': '🌸 Blossom Derby Task',
      'description': 'Enter thread for complete details.',
    },
    'requestHelpMessage': {
      'title': '🌸 Blossom Derby Task',
      'description': '**If you would like to take this task, please react by clicking 🌸.** Once you have completed the task, remove your reaction so that we can keep an accurate count of who needs to complete it.  If multiple tasks for the same activity come up, **click the reaction again to put yourself in the queue**.\n\nRemember the **Blossom Task Etiquette**: Complete the task as quickly as possible so we can give everyone the opportunity to take it and get the most amount of points.  For Town Visitor Tasks, make sure you have ALL of the required visitors before taking the task since the game is known to mess with you.',
    },
  },
};

export { discordSlashMetadata };

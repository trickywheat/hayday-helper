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

discordSlashMetadata.config = {
  'derbytype': [
    {
      'normal': {
        'infoEmbed': {
          'title': '🏇 Normal Derby',
          'description': 'A Normal Derby is up next! No special rules or strategy for this one… just make sure to pick up 320 tasks and get them all done by the end of the derby.\n\nIf you would like to refresh yourself on our general derby rules, or check the trash list then head on over to [our website](https://azuremeadows.github.io/Derbies/rules.html).\n\nIf you have something unexpected or personal that pops up during the derby that prevents you from finishing your tasks, or picking up a non-320 task, then please reach out to an elder/co-leader/leader and let us know… else you may get a strike.',
        },
      },
    },
    {
      'bingo': {
        'infoEmbed': {
          'title': '🐶 Bingo Derby',
          'description':'The Bingo Derby is up next!  If you are unfamiliar with it, please visit the [Wiki](https://hayday.fandom.com/wiki/Derby_Types#Bingo_derby).\n\nFor this derby we are given a new tab on the derby screen that contains a bingo card and to get the extra rewards we need to complete three lines from this bingo card (these lines can be horizontally, vertically or diagonally).\n\nOnce the derby starts, and the bingo card has been analysed, a strategy on how we want to tackle it and what lines we will focus will be communicated so please watch out for further pings.\n\nUntil we have finished the three lines on the bingo card outlined in the strategy, please prioritise those tasks.',
        },
        'scheduledTasks': {},
      },
    },
  ],
};

export { discordSlashMetadata };
import { discordConstants } from '../discordConsts.js';
import { installSlashCommand } from '../installSlashCommands.js';

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
          'name': 'Bingo',
          'value': 'derby_bingo',
        },
        {
          'name': 'Blossom',
          'value': 'derby_blossom',
        },
        {
          'name': 'Bunny',
          'value': 'derby_bunny',
        },
        {
          'name': 'Chill',
          'value': 'derby_chill',
        },
        {
          'name': 'Mystery',
          'value': 'derby_mystery',
        },
        {
          'name': 'Mystery Bunny',
          'value': 'derby_mysterybunny',
        },
        {
          'name': 'Normal',
          'value': 'derby_normal',
        },
        {
          'name': 'Power',
          'value': 'derby_power',
        },
        {
          'name': 'Power Bunny',
          'value': 'derby_powerbunny',
        },
        {
          'name': 'Infrequent',
          'value': 'derby_infrequent',
        },
      ],
    },
  ],
};

discordSlashMetadata.config = {
  'derbytype': [
    {
      'bingo': {
        'infoEmbed': {
          'title': '🐶 Bingo Derby',
          'description': 'The Bingo Derby is up next!  If you are unfamiliar with it, please visit the [Wiki](https://hayday.fandom.com/wiki/Derby_Types#Bingo_derby).\n\nFor this derby we are given a new tab on the derby screen that contains a bingo card and to get the extra rewards we need to complete three lines from this bingo card (these lines can be horizontally, vertically or diagonally).\n\nOnce the derby starts, and the bingo card has been analysed, a strategy on how we want to tackle it and what lines we will focus will be communicated so please watch out for further pings.\n\nUntil we have finished the three lines on the bingo card outlined in the strategy, please prioritise those tasks.',
        },
        'scheduledTasks': {},
      },
    },
    {
      'blossom': {
        'infoEmbed': {
          'title': '🌸 Blossom Derby',
          'description': 'The Blossom Derby is up next!  If you are unfamiliar with it, please visit the [Wiki](https://hayday.fandom.com/wiki/Derby_Types#Blossom_derby).\n \nBlossom tasks will appear on the board with a border and flower. When taken and completed they will return back to the board for someone else to complete but worth more points.\n\nThese tasks start at 320 points and will increase to 350, 370 and 400 points. \n\nIf you can take Blossom tasks then please do and focus on completing them as soon as possible to give people more time to complete it worth more points.\n\nPlease note that during this derby there are less tasks on the board than usual, and they typically are lower than 320, so be patient while we cycle through the tasks to populate the board with eligible tasks.',
        },
      },
    },
    {
      'bunny': {
        'infoEmbed': {
          'title': '🐰 Bunny Derby',
          'description': 'The Bunny Derby is up next! If you are unfamiliar with it, please visit the [wiki](https://hayday.fandom.com/wiki/Derby_Types#Bunny_derby).\n\nDuring this derby there will be 3 bunnies to catch for extra rewards and the only way to catch them are by completing enough tasks that are picked up during ‘Bunny Time’.\n\nBunny time happens periodically throughout the derby and will only last ten minutes each time. The game displays the time until the next bunny time which is visible on the derby screen. During bunny time the tasks will turn pink which means that when completed it will count towards catching the current bunny!\n\nYou do NOT need to complete tasks during bunny time for them to count, you simply need to pick it up during bunny time and complete it whenever you can (which includes outside of bunny time). \n\nPlease note that the three bunnies are staggered over the course of the derby so if you can then hold back on rushing to complete all your tasks in the first couple days so we have the best chance to catch them all.',
        },
      },
    },
    {
      'chill': {
        'infoEmbed': {
          'title': '⛄ Chill Derby',
          'description': 'The Chill Derby is up next! If you are unfamiliar with it, please visit the [wiki](https://hayday.fandom.com/wiki/Derby_Types#Chill_derby).\n\nThis week there will be no competition with other neighbourhoods, just a good old friendly competition between neighbours! Who’ll come out on top?\n\nYou will have 5 tasks to complete **each day** but don’t worry they are simple, and all the tasks are only 50 points. \n\nIt’s important that you keep in mind that the task quota for this derby resets a lot earlier than in other derbies! It resets at 12am GMT, you’ll need to work out what that is for you so you don’t get caught out!',
        },
      },
    },
    {
      'chillbunny': {
        'infoEmbed': {
          'title': '⛄ 🐰 Chill Bunny Derby',
          'description': 'The Chill Bunny Derby is up next! If you are unfamiliar with it, please see the wikis for both the [Chill Derby](https://hayday.fandom.com/wiki/Derby_Types#Chill_derby) and the [Bunny Derby](https://hayday.fandom.com/wiki/Derby_Types#Bunny_derby).\n\nThis week there will be no competition with other neighbourhoods, just a good old friendly competition between neighbours! Who’ll come out on top?\n\nYou will have 5 tasks to complete each day but don’t worry they are simple, and all the tasks are only 50 points. \n\nDuring this derby there will be 3 bunnies to catch for extra rewards and the only way to catch them are by completing enough tasks that are picked up during "Bunny Time".\n\nBunny time happens periodically throughout the derby and will only last ten minutes each time. The game displays the time until the next bunny time which is visible on the derby screen. During bunny time the tasks will turn pink which means that when completed it will count towards catching the current bunny!\n\nYou do NOT need to complete tasks during bunny time for them to count, you simply need to pick it up during bunny time and complete it whenever you can (which includes outside of bunny time).\n \nPlease note that the three bunnies are staggered over the course of the derby so if you can then hold back on rushing to complete all your tasks in the first couple days so we have the best chance to catch them all.\n\nIt’s important that you keep in mind that the task quota for this derby resets a lot earlier than in other derbies! It resets at 12am GMT, you’ll need to work out what that is for you so you don’t get caught out!',
        },
      },
    },
    {
      'mystery': {
        'infoEmbed': {
          'title': '❓ Mystery Derby',
          'description': 'The Mystery Derby is up next! If you are unfamiliar with it, please visit the [wiki](https://hayday.fandom.com/wiki/Derby_Types#Mystery_derby)\n\nDuring this derby the task board will have some mystery tasks appear which you will be able to tell by the purple question mark on it and being worth 400 points!\n\nYou will only find out what the task is, once you have selected it! Make sure you are prepared as best you can, as these tasks can literally be any derby task!\n\nIf you are looking to pick up a task and are tight on time (work/sleep etc) then please avoid taking a mystery task until you have more time as it is possible you might get a time sensitive one which needs your constant attention (e.g. wheat or egg collection within a few hours).\n\nNot feeling adventurous or like taking a risk? Don’t worry as there are regular derby tasks on the board as well for the taking.\n',
        },
      },
    },
    {
      'mysterybunny': {
        'infoEmbed': {
          'title': '❓ 🐰 Mystery Bunny Derby',
          'description': 'The Mystery Bunny Derby is up next! If you are unfamiliar with it, please see the wikis for both the [Mystery Derby](https://hayday.fandom.com/wiki/Derby_Types#Mystery_derby) and the [Bunny Derby](https://hayday.fandom.com/wiki/Derby_Types#Bunny_derby).\n\nDuring this derby there will be 3 bunnies to catch for extra rewards, and the task board will have some mystery tasks appear which you will be able to tell by the purple question mark on it and being worth 400 points!\n\nYou will only find out what the mystery task is, once you have selected it! Make sure you are prepared as best you can, as these tasks can literally be any derby task!\n\nIf you are looking to pick up a task and are tight on time (work/sleep etc) then please avoid taking a mystery task until you have more time as it is possible you might get a time sensitive one which needs your constant attention (e.g. wheat or egg collection within a few hours).\n\nBunny time happens periodically throughout the derby and will only last ten minutes each time. The game displays the time until the next bunny time which is visible on the derby screen. During bunny time the tasks will turn pink which means that when completed it will count towards catching the current bunny!\n\nYou do NOT need to complete tasks during bunny time for them to count, you simply need to pick it up during bunny time and complete it whenever you can (which includes outside of bunny time). \n\nPlease note that the three bunnies are staggered over the course of the derby so if you can then hold back on rushing to complete all your tasks in the first couple days so we have the best chance to catch them all.\n\nNot feeling adventurous or like taking a risk? Don’t worry as there are regular derby tasks on the board as well for the taking.',
        },
      },
    },
    {
      'normal': {
        'infoEmbed': {
          'title': '🏇 Normal Derby',
          'description': 'A Normal Derby is up next! No special rules or strategy for this one… just make sure to pick up 320 tasks and get them all done by the end of the derby.\n\nIf you would like to refresh yourself on our general derby rules, or check the trash list then head on over to [our website](https://azuremeadows.github.io/Derbies/rules.html).\n\nIf you have something unexpected or personal that pops up during the derby that prevents you from finishing your tasks, or picking up a non-320 task, then please reach out to an elder/co-leader/leader and let us know… else you may get a strike.',
        },
      },
    },
    {
      'power': {
        'infoEmbed': {
          'title': '💪 Power Derby',
          'description': 'The Power Derby is up next! If you are unfamiliar with it, please visit the [wiki](https://hayday.fandom.com/wiki/Derby_Types#Power_derby)\n\nDuring this derby you will have to complete more tasks that usual, but the tasks are easier than normal non-themed derbies.\n\nAs we are in the Champions League that means you’ll have 18 tasks to complete this derby.\n',
        },
      },
    },
    {
      'powerbunny': {
        'infoEmbed': {
          'title': '💪 🐰 Power Bunny Derby',
          'description': 'The Power Bunny Derby is up next! If you are unfamiliar with it, please see the wikis for both the [Power Derby](https://hayday.fandom.com/wiki/Derby_Types#Power_derby) and the [Bunny Derby](https://hayday.fandom.com/wiki/Derby_Types#Bunny_derby).\n\nDuring this derby there will be 3 bunnies to catch for extra rewards, and you will have to complete 18 tasks (but the tasks are slightly easier than usual).\n\nBunny time happens periodically throughout the derby and will only last ten minutes each time. The game displays the time until the next bunny time which is visible on the derby screen. During bunny time the tasks will turn pink which means that when completed it will count towards catching the current bunny!\n\nYou do NOT need to complete tasks during bunny time for them to count, you simply need to pick it up during bunny time and complete it whenever you can (which includes outside of bunny time). \n\nPlease note that the three bunnies are staggered over the course of the derby so if you can then hold back on rushing to complete all your tasks in the first couple days so we have the best chance to catch them all.',
        },
      },
    },
    {
      'infrequent': {
        'infoEmbed': {
          'title': '❓ Infrequent Derby',
          'description': 'Very little information is available about the next derby.  Please review the information that the Elders paste below before signing up.',
        },
      },
    },
  ],
};

export { discordSlashMetadata };

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
  return discordResponse;
}

if (process.env.INSTALL_COMMAND) {
  install().then((discordResponse) => {
    console.log(`Command ${discordResponse.name} installed on Guild ${discordResponse.guild_id} with id ${discordResponse.id}`);
  });
}

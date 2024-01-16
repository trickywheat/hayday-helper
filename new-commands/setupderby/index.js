import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';

export { discordSlashMetadata };

export async function execute(requestJSON, _event, _context) {
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'flags': discordConstants.messageFlags.EPHEMERAL,
    },
  };
  console.log('requestJSON: ' + JSON.stringify(requestJSON));

  responseJson.data.embeds = [
    {
      'title': `🏇 Normal Derby`,
      'description': 'A Normal Derby is up next! No special rules or strategy for this one… just make sure to pick up 320 tasks and get them all done by the end of the derby.\n\nIf you would like to refresh yourself on our general derby rules, or check the trash list then head on over to [our website](https://azuremeadows.github.io/Derbies/rules.html).\n\nIf you have something unexpected or personal that pops up during the derby that prevents you from finishing your tasks, or picking up a non-320 task, then please reach out to an elder/co-leader/leader and let us know… else you may get a strike.',
      'color': 0x7ED321,
    },
  ];

  return responseJson;
}
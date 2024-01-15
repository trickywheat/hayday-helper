/*
  Ping Command
  Type: CHAT_INPUT
*/
import { discordConstants } from './discordConsts.js';

export const discordSlashMetadata = {
  'discordSlashMetadata': {
    'name': 'ping',
    'type': discordConstants.applicationCommandType.CHAT_INPUT,
    'description': 'ping!  Replies with pong.',
  },
};

export function execute() {
  const responseJson = {
    'type': 4,
    'data': {
      'content': 'PONG!',
    },
  };

  return responseJson;
}

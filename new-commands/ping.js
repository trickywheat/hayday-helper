/*
  Ping Command
  Type: CHAT_INPUT
*/

export const discordSlashMetadata = {
  'discordSlashMetadata': {
    'name': 'ping',
    'type': 1,
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

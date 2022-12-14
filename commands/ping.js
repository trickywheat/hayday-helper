/*
  Ping Command
  Type: CHAT_INPUT
*/

module.exports = {
  'discordSlashMetadata': {
    'name': 'ping',
    'type': 1,
    'description': 'ping!  Replies with pong.',
  },

  execute() {
    const responseJson = {
      'type': 4,
      'data': {
        'content': 'PONG!',
      },
    };

    return responseJson;
  },
};
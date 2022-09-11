/*
  Ping Command
  Type: CHAT_INPUT
*/

module.exports = {
  "discordSlashMetadata": {
    "name": "ping",
    "type": 1, 
    "description": "ping!  Replies with pong."
  },

  execute(msg, args) {
    msg.reply('I am alive!');
    // msg.channel.send('bar');
  },
};
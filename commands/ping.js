module.exports = {
    name: 'ping',
    description: 'ping!',
    execute(msg, args) {
      msg.reply('I am alive!');
      // msg.channel.send('bar');
    },
};
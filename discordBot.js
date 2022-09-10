require('dotenv').config();
const winston = require('winston');
const Discord = require('discord.js');

// Winston Logger Declarations
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({format: winston.format.combine(winston.format.colorize(), winston.format.simple())}),
    new winston.transports.File({filename: 'logs/combined.log'})
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = '&';

// Discord.js Declarations
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Load Commands
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

// Start Bot
bot.login(TOKEN);

bot.on('ready', () => {
  logger.info(`Logged in as ${bot.user.tag}!`);
});

// Process Messages
bot.on('message', msg => {
  // Check to make sure that the message starts with the prefix.  Otherwise, quietly ignore
  if (msg.content.startsWith(PREFIX)) {
    // Remove the prefix and then split the command by arguments.
    const args = msg.content.substring(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    logger.info(`Called command: ${command}`);

    if (!bot.commands.has(command)) return;

    try {
      bot.commands.get(command).execute(msg, args);
    } catch (error) {
      logger.error(error);
      msg.reply('there was an error trying to execute that command!');
    }
  }
});
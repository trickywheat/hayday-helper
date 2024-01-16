export const discordConstants = {
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object
  'applicationCommandType': {
    'CHAT_INPUT': 1,
    'USER': 2,
    'MESSAGE': 3,
  },
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
  'applicationCommandOptionType': {
    'SUB_COMMAND': 1,
    'SUB_COMMAND_GROUP': 2,
    'STRING': 3,
    'INTEGER': 4,
    'BOOLEAN': 5,
    'USER': 6,
    'CHANNEL': 7,
    'ROLE': 8,
    'MENTIONABLE': 9,
    'NUMBER': 10,
    'ATTACHMENT': 12,
  },
  // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
  'responseInteractionType': {
    'PING': 1,
    'CHANNEL_MESSAGE_WITH_SOURCE': 4,
    'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE': 5,
    'DEFERRED_UPDATE_MESSAGE': 6,
    'UPDATE_MESSAGE': 7,
    'APPLICATION_COMMAND_AUTOCOMPLETE_RESULT': 8,
    'MODAL': 9,
    'PREMIUM_REQUIRED': 10,
  },
  // https://discord.com/developers/docs/resources/channel#message-object-message-flags
  'messageFlags': {
    'EPHEMERAL': 1 << 6,
    'LOADING': 1 << 7,
  },
};

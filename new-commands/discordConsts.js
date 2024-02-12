export const discordConstants = {
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object
  'applicationCommandType': {
    'COMMAND_RESPONSE': -1,
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
  // https://discord.com/developers/docs/resources/channel#channel-object-channel-types
  'channelTypes': {
    'PUBLIC_THREAD': 11,
  },
  // https://discord.com/developers/docs/interactions/message-components#component-object
  'componentType': {
    'ACTION_ROW': 1,
    'BUTTON': 2,
    'STRING_SELECT': 3,
    'TEXT_INPUT': 4,
    'USER_SELECT': 5,
    'ROLE_SELECT': 6,
    'MENTIONABLE_SELECT': 7,
    'CHANNEL_SELECT': 8,
  },
  // https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
  'buttonStyle': {
    'PRIMARY': 1,
    'SECONDARY': 2,
    'SUCCESS': 3,
    'DANGER': 4,
    'LINK': 5,
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
  // https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles
  'modalTextInputStyle': {
    'SHORT': 1,
    'PARAGRAPH': 2,
  },
  // https://discord.com/developers/docs/resources/channel#message-object-message-flags
  'messageFlags': {
    'EPHEMERAL': 1 << 6,
    'LOADING': 1 << 7,
  },
};

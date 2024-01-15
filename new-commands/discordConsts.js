export const discordConstants = {
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object
  'applicationCommandType': {
    'CHAT_INPUT': 1,
    'USER': 2,
    'MESSAGE': 3,
  },
  // https://discord.com/developers/docs/interactions/message-components#what-is-a-component
  'responseComponentType': {
    'textInput': 4,
  },
  // https://discord.com/developers/docs/resources/channel#message-object-message-flags
  'messageFlags': {
    'EPHEMERAL': 1 << 6,
    'LOADING': 1 << 7,
  },
};

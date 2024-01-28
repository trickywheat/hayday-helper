import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { readJSONFile } from '../utilities.js';

export { discordSlashMetadata };

export async function execute(requestJSON) {
  const { guild_id: guildId } = requestJSON;
  const serverConfig = await readJSONFile(`./config/${guildId}.json`);
  const requestChoice = requestJSON.data.values[0];

  const requestTypeObject = serverConfig.requestTypes.find((i) => i.value == requestChoice);
  const placeholder = (requestTypeObject ? requestTypeObject.placeholder : null);

  const responseJson = {
    'type': discordConstants.responseInteractionType.MODAL,
    'data': {
      'custom_id': 'requestHelpMessage',
      'title': 'Tell us about your request',
      'components': [
        {
          'type': discordConstants.componentType.ACTION_ROW,
          'components': [{
            'type': discordConstants.componentType.TEXT_INPUT,
            'custom_id': 'requestHelp',
            'style': discordConstants.modalTextInputStyle.PARAGRAPH,
            'label': 'Try to be descriptive, but brief.',
            'required': true,
            'placeholder': placeholder,
          }],
        }],
    },
  };

  return responseJson;
}
import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';

export { discordSlashMetadata };

export async function execute(requestJSON, _event, _context) {
  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {},
  };
  console.log('requestJSON: ' + JSON.stringify(requestJSON));

  const { value: requestedDerbyType } = requestJSON.data.options[0];
  const [ , derbyName ] = requestedDerbyType.split('_');

  console.log('requestedDerbyType: ' + requestedDerbyType);
  console.log('derbyName: ' + derbyName);
  const { [derbyName]: derbyConfig } = discordSlashMetadata.config.derbytype.find((element) => Object.keys(element)[0] == derbyName);

  responseJson.data.embeds = derbyConfig.infoEmbed;

  return responseJson;
}

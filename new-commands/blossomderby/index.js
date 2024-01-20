import { discordConstants } from '../discordConsts.js';
import { discordSlashMetadata } from './commandMetadata.js';
import { installSlashCommand } from '../installSlashCommands.js';

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

  responseJson.data.embeds = [derbyConfig.infoEmbed];

  // Gets the next Tuesday's date
  // https://stackoverflow.com/questions/33078406/getting-the-date-of-next-monday
  const d = new Date();
  d.setDate(d.getDate() + (2 + 7 - d.getDay()) % 7);
  responseJson.data.embeds[0].title += ' - ' + d.toDateString();

  return responseJson;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
}

if (process.env.INSTALL_COMMAND) {
  install().then(() => {
    console.log('Done.');
  });
}

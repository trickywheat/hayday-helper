/*
  Ping Command
  Type: CHAT_INPUT
*/
import { discordConstants } from './discordConsts.js';
import { installSlashCommand } from './installSlashCommands.js';
import { readJSONFile } from './utilities.js';

export const discordSlashMetadata = {
  'name': 'about',
  'type': discordConstants.applicationCommandType.CHAT_INPUT,
  'description': 'Gives you information about the bot.',
};

export async function execute(_requestJSON, lambdaEvent) {
  const npmPackage = await readJSONFile('../package.json');
  const npmVersion = process.env.npm_package_version || npmPackage.version || 'undefined';
  // "1.5.0+build.5-commit.57cffe2ecb84cc0a644b76a4d9a4b17e0769abbb"

  console.log('process.env: ' + JSON.stringify(process.env));
  console.log('npmVersion: ' + JSON.stringify(npmPackage));
  const versionObject = {
    'version': npmVersion.split('+')[0],
  };

  if (npmVersion.split('+').length > 1) {
    const buildMetadata = npmVersion.split('+')[1].split('-');
    for (let index = 0; index < buildMetadata.length; index++) {
      const [ name, value ] = buildMetadata[index].split('.');
      if (name.length > 0)
        versionObject[name] = (value.length > 0 ? value : 'undefined');
    }
  }

  const buildId = versionObject.build || 'local-build';
  const commitSha = versionObject.commit || 'local-commit';

  const regex = new RegExp('(^\\w{3})\\w+(\\w{3})', 'gm');
  const subst = '$1...$2';
  const functionUrl = lambdaEvent.requestContext.domainPrefix.replace(regex, subst) || 'local-deployment';

  let buildUrl = 'https://github.com/trickywheat/hayday-helper/actions';
  let commitUrl = 'https://github.com/trickywheat/hayday-helper';
  if (commitSha !== 'local-commit') {
    commitUrl = `https://github.com/trickywheat/hayday-helper/commit/${commitSha}`;
    buildUrl = `${commitUrl}/checks`;
  }

  const responseJson = {
    'type': discordConstants.responseInteractionType.CHANNEL_MESSAGE_WITH_SOURCE,
    'data': {
      'flags': discordConstants.messageFlags.EPHEMERAL,
      'embeds': [
        {
          'title': `HayDay Helper Bot - v${versionObject.version}`,
          'description': `Developed with ♥ and 🍪.\n\nBuild: [${buildId}](${buildUrl})\nCommit SHA: [${commitSha}](${commitUrl})\nAbstract function URL: ${functionUrl}\n\nTo submit a bug report or make a feature request, please [create an Issue in GitHub](https://github.com/trickywheat/hayday-helper/issues). `,
          'color': 0x00FFFF,
        },
      ],
    },
  };

  return responseJson;
}

export async function install() {
  const discordResponse = await installSlashCommand(discordSlashMetadata.commandMetadata);
  console.log(discordResponse);
}

if (process.env.INSTALL_COMMAND) {
  install().then(() => {
    console.log(`Command ${discordSlashMetadata.name} installed.`);
  });
}

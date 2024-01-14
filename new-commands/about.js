/*
  Ping Command
  Type: CHAT_INPUT
*/

export const discordSlashMetadata = {
  'name': 'about',
  'type': 1,
  'description': 'Gives you information about the bot.',
};

export function execute(_requestJSON, lambdaEvent) {
  const npmVersion = process.env.npm_package_version || 'undefined';
  // "0.1.0+build.19-commit.a37074cc008d90ec9b87279232cc6014e3312e9c"

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
    'type': 4,
    'data': {
      'flags': 1 << 6,
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

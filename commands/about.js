/*
  Ping Command
  Type: CHAT_INPUT
*/

module.exports = {
  'discordSlashMetadata': {
    'name': 'about',
    'type': 1,
    'description': 'Gives you information about the bot.',
  },

  async execute(_requestJSON, lambdaEvent) {
    const packageJson = require('../package.json');

    const regex = new RegExp('(^\\w{3})\\w+(\\w{3})', 'gm');
    const subst = '$1...$2';
    const buildId = process.env.BUILD_ID || 'local-build';
    const commitSha = process.env.GIT_SHA || 'local-commit';
    const functionUrl = lambdaEvent.requestContext.domainPrefix.replace(regex, subst) || 'local-deployment';

    const responseJson = {
      'type': 4,
      'data': {
        'flags': 1 << 6,
        'embeds': [
          {
            'title': `Hayday Helper Bot - v${packageJson.version}`,
            'description': `Developed with ♥ and 🍪.\n\nBuild: ${buildId}\nCommit SHA: ${commitSha}\nAbstract function URL: ${functionUrl}\n\nTo submit a bug report or make a feature request, please [create an Issue in GitHub](https://github.com/trickywheat/hayday-helper/issues). `,
            'color': 0x00FFFF,
          },
        ],
      },
    };

    return responseJson;
  },
};
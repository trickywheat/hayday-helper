import { handler } from '../index';

test('Postman Ping Test', async () => {
  const lambdaEvent = {
    'headers': {
      'authorization': 'Bearer ' + process.env.POSTMAN_VERIFY,
    },
    'requestContext': {
      'domainPrefix': 'jestiotest',
      'http': {
        'method': 'POST',
        'path': '/discord',
      },
    },
    'body': JSON.stringify({
      'type': 1,
    }),
  };

  const result = await handler(lambdaEvent, {});
  expect(result.statusCode).toEqual(200);

  const bodyJson = JSON.parse(result.body);
  expect(bodyJson.type).toBe(1);
});

test('Discord Cryptographic Ping Test', async () => {
  const lambdaEvent = {
    'headers': {
      'x-signature-ed25519': '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'x-signature-timestamp': '00000000',
    },
    'requestContext': {
      'http': {
        'method': 'POST',
        'path': '/discord',
      },
    },
    'body': JSON.stringify({
      'type': 1,
    }),
  };

  process.env.DISCORD_BOT_PUBLIC_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

  const result = await handler(lambdaEvent, {});
  expect(result.statusCode).toEqual(401);

  const bodyJson = JSON.parse(result.body);
  expect(bodyJson.message).toBe('Bad request signature');
});

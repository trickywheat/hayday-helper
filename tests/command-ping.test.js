import { handler } from '../index';

test('Command: ping', async () => {
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
      'data': {
        'custom_id': 'ping',
      },
    }),
  };

  const result = await handler(lambdaEvent, {});
  expect(result.statusCode).toEqual(200);
  console.log(JSON.stringify(result));

  expect(result.body).toMatch('PONG!');
});

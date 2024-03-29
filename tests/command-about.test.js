import { handler } from '../index';

test('Command: about', async () => {
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
        'custom_id': 'about',
      },
    }),
  };

  const result = await handler(lambdaEvent, {});
  expect(result.statusCode).toEqual(200);
  console.log(JSON.stringify(result));

  const bodyJson = JSON.parse(result?.body);
  expect(bodyJson?.data?.embeds?.[0]?.title).toMatch('HayDay Helper Bot - v');
});


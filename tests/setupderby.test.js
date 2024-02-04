import { handler } from '../index';

test('Command: setupderby', async () => {
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
        'name': 'setupderby',
        'options': [
          {
            'name': 'derbytype',
            'type': 3,
            'value': 'derby_bingo',
          },
        ],
      },
    }),
  };

  const result = await handler(lambdaEvent, {});
  expect(result.statusCode).toEqual(200);
  console.log(JSON.stringify(result));

  expect(result.body).toMatch('Bingo Derby');
});

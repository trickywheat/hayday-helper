import { handler } from '../index';

test('Command: blossomderby.createtask (pingderby = true)', async () => {
  const lambdaEvent = {
    'callbackExecute': 1,
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
        'name': 'blossomderby',
        'options': [
          {
            'name': 'createtask',
            'options': [
              {
                'name': 'taskname',
                'type': 3,
                'value': 'Wheat',
              },
              {
                'name': 'pingderby',
                'type': 5,
                'value': true,
              },
            ],
            'type': 1,
          },
        ],
      },
    }),
  };

  const result = await handler(lambdaEvent, {});

  console.log(JSON.stringify(result));
  expect(result?.StatusCode).toEqual(202);
  console.log(JSON.stringify(result));
});


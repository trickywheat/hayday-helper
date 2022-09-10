 const nacl = require('tweetnacl'); 
  // const fs = require('fs');
  // const html = fs.readFileSync('index.html', { encoding:'utf8' });

/**
 * Returns an HTML page containing an interactive Web-based
 * tutorial. Visit the function URL to see it and learn how
 * to build with lambda.
 */
exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  let responseJson = {
    statusCode: 500,
    headers: {
        'Content-Type': 'application/json',
    },
    body: '{"message": "I\'m a teapot"}',
  };

  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const isValidRequest = nacl.sign.detached.verify(
    Buffer.from(timestamp + event.body), 
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_BOT_PUBLIC_KEY, 'hex')
  );

  if (!isValidRequest) {
    responseJson.status = 401;
    responseJson.body = '{"message": "Bad request signature"}';
  } else {
    if ((event.requestContext.http.method === "POST") && (event.body.length > 1)) {
        const jsonPayload = JSON.parse(event.body);
        console.log(JSON.stringify(jsonPayload));
        if (jsonPayload.type == 1) {
          responseJson.statusCode = 200;
          responseJson.body = '{"type": 1}';
        }
    }
  }
  
  return responseJson;
};

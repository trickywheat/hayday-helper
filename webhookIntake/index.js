const discordInteractions = require('discord-interactions');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("event object: " + JSON.stringify(event));

  let responseJson = {
    statusCode: 418,
    headers: {
        'Content-Type': 'application/json',
    },
    body: '{"message": "I am a teapot"}',
  };

  let isValidRequest = false;

  if (event.headers.hasOwnProperty("authorization") && 
     (event.headers['authorization'] === "Bearer " + process.env.POSTMAN_VERIFY)) {
    isValidRequest = true;
  } else {
    // Get valid information
    const signature = event.headers['x-signature-ed25519'];
    const timestamp = event.headers['x-signature-timestamp'];
    const publicKey = process.env.DISCORD_BOT_PUBLIC_KEY;

    isValidRequest = discordInteractions.verifyKey(event.body, signature, timestamp, publicKey);
  }

  if (!isValidRequest) {
    responseJson.statusCode = 401;
    responseJson.body = '{"message": "Bad request signature"}';
  } else {
    if ((event.requestContext.http.method === "POST") && (event.body.length > 1)) {
      const requestJSON = JSON.parse(event.body);
      console.log("Discord webhook Payload: " + JSON.stringify(requestJSON));

      responseJson.statusCode = 200;
      if (requestJSON.type == 1) {
        // Handle Pings
        responseJson.body = '{"type": 1}';
      } else {
        let responseBody = {
          "type": 5,
          "data": {
            "flags": 1 << 6
          }
        };

        // Send payload to interactionWorkflow
        const commandInput = {
          FunctionName: "Discord-interactionWorkflow",
          InvocationType: "Event",
          Payload: event.body
        }
  
        const command = new InvokeCommand(commandInput);

        try {
          const lambdaResponse = await client.send(command);
          console.log("Response from Lambda: " + JSON.stringify(lambdaResponse));

          if (lambdaResponse.StatusCode != 202) {
            responseBody.type = 4;
            responseBody.data.content = "There was an issue executing `interactionWorkflow`.  requestId=`" + event.requestContext.requestId + "`";
          }
        } catch (error) {
          responseBody.type = 4
          responseBody.data.content = "There was an issue with `webhookIntake`.  requestId=`" + event.requestContext.requestId + "`"
        }

        responseJson.body = JSON.stringify(responseBody);
      }
    }
  }

  console.log("respondJson: " + JSON.stringify(responseJson));
  return responseJson;
};


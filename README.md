# HayDay Helper Discord Bot - Built on AWS Lambda

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/trickywheat/hayday-helper)

I built a bot that helps a Discord server keep it's requests organized and orderly.  All using AWS Lambdas.

This bot currently has one feature: it builds a drop-down menu giving members the ability to request different types of things: rares, crops, tasks, etc.

The bot then creates a post and then a **public** thread is created, pinging the original requester.  The thread can then be deleted once members have completed their trade/discussion.

!TO DO: Screenshot GIF

# This project is Open Source!

If you would like to run this exact bot, you can do so!  Documentation is a bit sparce right now but if you are a developer with knowledge about Discord and AWS, you can deploy this on your AWS Cloud.

While I used [@jakjus's](https://github.com/jakjus) [article as a guide](https://betterprogramming.pub/build-a-discord-bot-with-aws-lambda-api-gateway-cc1cff750292), AWS released [function URLs](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/) which greatly simplies the ability to receive webhooks from Discord, or any other service.  There are distinct and important differences as to why you might use an API Gateway over a Lambda Function URL but I will leave that for the reader to decide.

# Environment Variables needed:

| Name | Description | Required |
|------|-------------|----------|
| DISCORD_BOT_PUBLIC_KEY | Your Discord Bot's public key, available from the bot's Application "General Information" | Yes |
| DISCORD_BOT_TOKEN	| Your Discord Bot's Token Secret, available from the bot's Application "Bot" page | Yes |
| DISCORD_BOT_APP_ID | Your Discord Bot's App ID, available from the bot's Application "Bot" page | Yes |
| POSTMAN_VERIFY | For fast prototyping, you can trigger your lambda using it's Function URL.  To authenticate, you can give this variable a long random string, such as a UUID. | No |


# This is a quick lambda code to keep track of WH Visa updates

The code gets as param a **country name** and a **desired status**. It checks for the Australian immigration portal around that country status (closed or open). If the current status == desired status, then it notifies the email set in the config of this repo.

This project uses a simple DynamoDB table to keep track of the last status update. This means the code will send the alert after status change *ONCE*. After that, the state table will already have the latest status and the alert will only be sent when there is a status change again.
This was implemented to prevent triggering an immense quantity of alerts, as this lambda is meant to be run many times per day.

## Config file

A template for the config file will be found in `cdk/config`. Use this template and create a `config.ts` in the same folder with the following information:

* URL: This is already populated with the Australian Immigration portal
* DESIRED_COUNTRY: The name of the country to be monitored (as it is in the portal)
* DESIRED_STATUS: `open` or `closed`
> Disclamer: This code does not support other types of status
* ACCOUNT_ID and REGION: The id  and region of AWS account
* EMAIL: The email of the receiver of the notifications
* SCHEDULE_MINUTES: An integer number representing the amount of minutes between every check

## Deploying


### IAM credentials and auth
1. Create an AWS Account
2. Inside your AWS Account, setup a new user with programmatic access
3. Install AWS CLI
4. Run `aws configure --profile <given_profile_name>` to login with your created user. If unsure, use https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html as guide
5. Depending on the auth method you choose to use (role, user...) you might need to generate a user token and update your `.aws/credentials` file
6. Update the `config.ts` file with the account id and region you wish the deploy

### CDK and other dependencies

1. Make sure node and npm are correctly installed in your environment. You will need npm to install and build the stack generated by AWS CDK 

> Use this as guide: https://docs.aws.amazon.com/cdk/v2/guide/prerequisites.html

### Finally... deploying
1. Make sure you update the `config.ts` file with all the needed variables
2. `npm install`
3. `npm build && npm test`
4. `npx cdk synth --profile <given_profile_name>` --> just to check for any AWS auth errors
5. `npx cdk deploy --profile <given_profile_name>`

## Costs

- Lambda: 1 million **free** requests per month. Considering a month of 31 days (44640 minutes). If you run the schedule every 5min, you do almost 9 thousand requests in the month. Still plenty left
- DynamoDB: 25 provisioned read and write capacity for **free**. Each request only requires 2 read capacity and maybe more for write if it gets updated
- SNS: Up until 1k email deliveries and publishes for **free**
- Eventbridge: 14 million schedule invocations **free** per month

https://aws.amazon.com/free/
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

interface WHVStackProps extends cdk.StackProps {
  url: string;
  desiredCountry: string;
  desiredStatus: string;
  email: string;
  schedule: number;
}

export class WHVStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WHVStackProps) {
    super(scope, id, props);

    const {desiredCountry, desiredStatus, email, url, schedule} = props;

    const stateTable = new cdk.aws_dynamodb.TableV2(this, 'state-table', {
      partitionKey: { name: 'status', type: cdk.aws_dynamodb.AttributeType.STRING },
    });

    const topic = new cdk.aws_sns.Topic(this, 'alert-topic');
    topic.addSubscription(new cdk.aws_sns_subscriptions.EmailSubscription(email));

    const fn = new lambda.Function(this, 'checker-function', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../application/lambda')),
      environment: {
        TABLE_NAME: stateTable.tableName,
        DESIRED_COUNTRY: desiredCountry,
        DESIRED_STATUS: desiredStatus,
        URL: url,
        SNS_TOPIC: topic.topicArn,
      },
      timeout: cdk.Duration.minutes(2),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'pandas-layer',
          'arn:aws:lambda:ap-southeast-2:336392948345:layer:AWSSDKPandas-Python313:1'
        )]
    });

    stateTable.grantReadWriteData(fn);
    topic.grantPublish(fn);

    const rule = new cdk.aws_events.Rule(this, 'schedule-rule', {
      schedule: cdk.aws_events.Schedule.rate(cdk.Duration.minutes(schedule)),
    });

    rule.addTarget(new cdk.aws_events_targets.LambdaFunction(fn));

  }
}

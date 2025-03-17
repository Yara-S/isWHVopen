import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WHVStack } from '../lib/app-stack';

test('Basic Resources created', () => {
   const app = new cdk.App();
   const stack = new WHVStack(app, 'MyTestStack', {
    env: { account: '123', region: 'us-east-1'},
    desiredCountry: '',
    desiredStatus: '',
    email: 'xxx@gmail.com',
    url: '',
    schedule: 1
   });
   const template = Template.fromStack(stack);
   template.hasResource('AWS::Lambda::Function', {});
   template.hasResource('AWS::DynamoDB::GlobalTable', {});
   template.hasResource('AWS::SNS::Topic', {});
   template.hasResource('AWS::SNS::Subscription', {});
});

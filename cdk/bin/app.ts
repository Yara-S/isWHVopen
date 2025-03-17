#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WHVStack } from '../lib/app-stack';
import { Config } from '../config/config';

const app = new cdk.App();
const {
  ACCOUNT_ID,
  REGION,
  DESIRED_COUNTRY,
  DESIRED_STATUS,
  URL,
  EMAIL,
  SCHEDULE_MINUTES
} = Config;

new WHVStack(app, 'WHVStack', {
  env: { account: ACCOUNT_ID, region: REGION},
  desiredCountry: DESIRED_COUNTRY,
  desiredStatus: DESIRED_STATUS,
  url: URL,
  email: EMAIL,
  schedule: SCHEDULE_MINUTES
});
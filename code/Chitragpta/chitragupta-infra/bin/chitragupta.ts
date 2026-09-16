#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { ModerationStack } from '../lib/moderation-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const data = new DataStack(app, 'ChitraguptaData', { env });

const auth = new AuthStack(app, 'ChitraguptaAuth', {
  env,
  table: data.table,
  tableKey: data.tableKey,
});

const moderation = new ModerationStack(app, 'ChitraguptaModeration', {
  env,
  table: data.table,
  tableKey: data.tableKey,
});

new ApiStack(app, 'ChitraguptaApi', {
  env,
  table: data.table,
  tableKey: data.tableKey,
  userPool: auth.userPool,
  userPoolClient: auth.userPoolClient,
  submissionQueue: moderation.submissionQueue,
  guardrailId: moderation.guardrailId,
  guardrailArn: moderation.guardrailArn,
});

new FrontendStack(app, 'ChitraguptaFrontend', { env });

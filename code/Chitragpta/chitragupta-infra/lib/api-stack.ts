import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  tableKey: kms.Key;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  submissionQueue: sqs.Queue;
  guardrailId: string;
  guardrailArn: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const authorizer = new authorizers.HttpUserPoolAuthorizer('UserPoolAuthorizer', props.userPool, {
      userPoolClients: [props.userPoolClient],
    });

    const httpApi = new apigwv2.HttpApi(this, 'ChitraguptaHttpApi', {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
        allowOrigins: ['*'], // tighten to the real frontend origin before launch
        allowHeaders: ['authorization', 'content-type'],
      },
    });

    const commonEnv = { TABLE_NAME: props.table.tableName };
    const nodeFn = (name: string, entry: string, extra: Partial<lambdaNode.NodejsFunctionProps> = {}) =>
      new lambdaNode.NodejsFunction(this, name, {
        entry: path.join(__dirname, entry),
        runtime: lambda.Runtime.NODEJS_24_X,
        bundling: { minify: true },
        environment: commonEnv,
        ...extra,
      });

    const submitFeedback = nodeFn('SubmitFeedback', '../lambda/submit-feedback/index.ts', {
      timeout: cdk.Duration.seconds(15),
      environment: {
        ...commonEnv,
        MODERATION_QUEUE_URL: props.submissionQueue.queueUrl,
        GUARDRAIL_ID: props.guardrailId,
      },
    });
    props.table.grantReadWriteData(submitFeedback);
    props.tableKey.grantEncryptDecrypt(submitFeedback);
    props.submissionQueue.grantSendMessages(submitFeedback);
    submitFeedback.addToRolePolicy(
      new iam.PolicyStatement({ actions: ['bedrock:ApplyGuardrail'], resources: [props.guardrailArn] }),
    );

    const getProfile = nodeFn('GetProfile', '../lambda/get-profile/index.ts', {
      environment: {
        ...commonEnv,
        USER_POOL_ID: props.userPool.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
      },
    });
    props.table.grantReadData(getProfile);
    props.tableKey.grantDecrypt(getProfile);

    const searchUsername = nodeFn('SearchUsername', '../lambda/search-username/index.ts');
    props.table.grantReadData(searchUsername);
    props.tableKey.grantDecrypt(searchUsername);

    const toggleLedger = nodeFn('ToggleLedger', '../lambda/toggle-ledger/index.ts');
    props.table.grantReadWriteData(toggleLedger);
    props.tableKey.grantEncryptDecrypt(toggleLedger);

    const reportEntry = nodeFn('ReportEntry', '../lambda/report-entry/index.ts');
    props.table.grantReadWriteData(reportEntry);
    props.tableKey.grantEncryptDecrypt(reportEntry);

    httpApi.addRoutes({
      path: '/feedback',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('SubmitFeedbackIntegration', submitFeedback),
      authorizer,
    });
    httpApi.addRoutes({
      path: '/users/{username}',
      methods: [apigwv2.HttpMethod.GET],
      // No authorizer: the profile summary is public. get-profile verifies
      // an optional Authorization header itself to decide whether the
      // caller is the profile's owner (see aws-jwt-verify usage there).
      integration: new integrations.HttpLambdaIntegration('GetProfileIntegration', getProfile),
    });
    httpApi.addRoutes({
      path: '/search',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('SearchIntegration', searchUsername),
    });
    httpApi.addRoutes({
      path: '/me/ledger-enabled',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ToggleLedgerIntegration', toggleLedger),
      authorizer,
    });
    httpApi.addRoutes({
      path: '/users/{username}/entries/{entrySk}/report',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ReportEntryIntegration', reportEntry),
      authorizer,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
  }
}

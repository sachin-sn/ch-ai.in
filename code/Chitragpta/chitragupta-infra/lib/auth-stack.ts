import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface AuthStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  tableKey: kms.Key;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const nodeFn = (name: string, entry: string, extra: Partial<lambdaNode.NodejsFunctionProps> = {}) =>
      new lambdaNode.NodejsFunction(this, name, {
        entry: path.join(__dirname, entry),
        runtime: lambda.Runtime.NODEJS_24_X,
        bundling: { minify: true },
        ...extra,
      });

    const definesAuthChallenge = nodeFn('DefineAuthChallenge', '../lambda/auth-define-challenge/index.ts');
    const createAuthChallenge = nodeFn('CreateAuthChallenge', '../lambda/auth-create-challenge/index.ts', {
      timeout: cdk.Duration.seconds(10),
    });
    const verifyAuthChallenge = nodeFn('VerifyAuthChallenge', '../lambda/auth-verify-challenge/index.ts');
    const preSignUp = nodeFn('PreSignUp', '../lambda/auth-pre-signup/index.ts');
    const postConfirmation = nodeFn('PostConfirmation', '../lambda/auth-post-confirmation/index.ts', {
      environment: { TABLE_NAME: props.table.tableName },
    });

    createAuthChallenge.addToRolePolicy(
      new iam.PolicyStatement({ actions: ['ses:SendEmail'], resources: ['*'] }),
    );
    props.table.grantWriteData(postConfirmation);
    props.tableKey.grantEncryptDecrypt(postConfirmation);

    this.userPool = new cognito.UserPool(this, 'ChitraguptaUserPool', {
      userPoolName: 'chitragupta-users',
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        // Collected only to enforce the 18+ gate in preSignUp — never
        // rendered back on any public profile.
        birthdate: { required: true, mutable: false },
      },
      lambdaTriggers: {
        defineAuthChallenge: definesAuthChallenge,
        createAuthChallenge,
        verifyAuthChallengeResponse: verifyAuthChallenge,
        preSignUp,
        postConfirmation,
      },
      accountRecovery: cognito.AccountRecovery.NONE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.userPoolClient = this.userPool.addClient('WebClient', {
      authFlows: { custom: true },
      // Returns the same generic response whether or not an account exists
      // for a given username/email — closes the enumeration gap from the
      // original "check username, then show Get OTP" flow.
      preventUserExistenceErrors: true,
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}

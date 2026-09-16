import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';

describe('AuthStack', () => {
  const app = new App();
  const data = new DataStack(app, 'TestDataStackForAuth');
  const stack = new AuthStack(app, 'TestAuthStack', { table: data.table, tableKey: data.tableKey });
  const template = Template.fromStack(stack);

  test('requires a birthdate attribute so pre-signup can enforce the age gate', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      Schema: Match.arrayWith([Match.objectLike({ Name: 'birthdate', Required: true, Mutable: false })]),
    });
  });

  test('wires all five Lambda triggers for the passwordless + age-gate flow', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      LambdaConfig: Match.objectLike({
        DefineAuthChallenge: Match.anyValue(),
        CreateAuthChallenge: Match.anyValue(),
        VerifyAuthChallengeResponse: Match.anyValue(),
        PreSignUp: Match.anyValue(),
        PostConfirmation: Match.anyValue(),
      }),
    });
  });

  test('the app client prevents user-existence errors, closing the enumeration gap', () => {
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      PreventUserExistenceErrors: 'ENABLED',
      ExplicitAuthFlows: Match.arrayWith([Match.stringLikeRegexp('CUSTOM_AUTH')]),
    });
  });
});

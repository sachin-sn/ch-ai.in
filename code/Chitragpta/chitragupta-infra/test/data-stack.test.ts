import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DataStack } from '../lib/data-stack';

describe('DataStack', () => {
  const app = new App();
  const stack = new DataStack(app, 'TestDataStack');
  const template = Template.fromStack(stack);

  test('creates a table keyed by PK/SK, encrypted with a customer-managed key', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      SSESpecification: Match.objectLike({ SSEEnabled: true, SSEType: 'KMS' }),
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('defines both global secondary indexes', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({ IndexName: 'GSI1-BySubmitter' }),
        Match.objectLike({ IndexName: 'GSI2-PendingPublish' }),
      ]),
    });
  });

  test('enables a DynamoDB stream for fold-summary to consume', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      StreamSpecification: { StreamViewType: 'NEW_AND_OLD_IMAGES' },
    });
  });

  test('the table key has rotation enabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', { EnableKeyRotation: true });
  });
});

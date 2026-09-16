import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';

export class DataStack extends cdk.Stack {
  public readonly table: dynamodb.Table;
  public readonly tableKey: kms.Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Customer-managed key rather than the default AWS-owned key, so key
    // rotation and access are ours to audit via CloudTrail.
    this.tableKey = new kms.Key(this, 'TableKey', {
      description: 'Customer-managed key for the Chitragupta table',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Single-table design. One item per user profile (SK='PROFILE') and one
    // item PER LEDGER ENTRY (SK='LEDGER#<type>#<ulid>') rather than an
    // embedded array — the array approach hits DynamoDB's 400KB item limit
    // once a popular or heavily-targeted user accumulates a few hundred
    // entries.
    this.table = new dynamodb.Table(this, 'ChitraguptaTable', {
      tableName: 'chitragupta',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.tableKey,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      // Streams feed fold-summary: counts/summaries update on the transition
      // into ACTIVE rather than being recomputed from the full ledger.
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Entries submitted BY a user — used for rate-limit bookkeeping and a
    // "things I've submitted" view.
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1-BySubmitter',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Sparse index: only PENDING paapa entries carry GSI2PK/GSI2SK, so this
    // index only ever holds what's still waiting out its 72h window. Lets
    // publish-pending-entries find due entries with a Query instead of a
    // table Scan.
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2-PendingPublish',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}

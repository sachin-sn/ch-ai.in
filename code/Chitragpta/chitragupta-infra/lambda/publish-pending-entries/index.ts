import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

// Runs on a 15-minute schedule (see ModerationStack). Queries the sparse
// GSI2 for paapa entries whose 72h pending window has elapsed, and flips
// them PENDING -> ACTIVE. Removing GSI2PK/GSI2SK in the same update drops
// the item out of the index, so already-published entries stop showing up
// here. The status flip is itself what triggers fold-summary, via the
// table's DynamoDB Stream.
export const handler = async (): Promise<void> => {
  const now = new Date().toISOString();

  const due = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2-PendingPublish',
      KeyConditionExpression: 'GSI2PK = :p AND GSI2SK <= :now',
      ExpressionAttributeValues: { ':p': 'PENDING_PAAPA', ':now': now },
    }),
  );

  for (const entry of due.Items ?? []) {
    try {
      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: entry.PK, SK: entry.SK },
          UpdateExpression: 'SET #status = :active REMOVE GSI2PK, GSI2SK',
          ConditionExpression: '#status = :pending',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':active': 'ACTIVE', ':pending': 'PENDING' },
        }),
      );
    } catch (err) {
      // Another concurrent run (or a moderator action) already moved this
      // entry on — safe to skip.
      if (!(err instanceof ConditionalCheckFailedException)) throw err;
    }
  }
};

import { PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { ddb, TABLE_NAME } from './dynamo-client';

// One active paapa entry per (poster, subject) pair at a time — stops a single
// person from pile-driving someone's ledger. Implemented as a conditional put
// on a dedicated marker item so the check-and-reserve is atomic (no read-then-
// write race between two concurrent submissions).
export async function reserveOneActivePaapaSlot(
  subjectUsername: string,
  submitterId: string,
  entryId: string,
): Promise<boolean> {
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${subjectUsername}`,
          SK: `RATE#PAAPA#${submitterId}`,
          entryId,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
    return true;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return false;
    throw err;
  }
}

// Called when a reserved entry is rejected by moderation (or removed later),
// freeing the slot so the same pair can submit again.
export async function releasePaapaSlot(subjectUsername: string, submitterId: string): Promise<void> {
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${subjectUsername}`, SK: `RATE#PAAPA#${submitterId}` },
    }),
  );
}

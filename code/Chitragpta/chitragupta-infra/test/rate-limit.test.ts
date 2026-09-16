import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { ddb, TABLE_NAME } from '../lambda/shared/dynamo-client';
import { reserveOneActivePaapaSlot, releasePaapaSlot } from '../lambda/shared/rate-limit';

const ddbMock = mockClient(ddb);

beforeEach(() => ddbMock.reset());

describe('reserveOneActivePaapaSlot', () => {
  test('reserves a slot when none exists yet', async () => {
    ddbMock.on(PutCommand).resolves({});

    const reserved = await reserveOneActivePaapaSlot('alice', 'bob', 'entry-1');

    expect(reserved).toBe(true);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: TABLE_NAME,
      Item: expect.objectContaining({ PK: 'USER#alice', SK: 'RATE#PAAPA#bob', entryId: 'entry-1' }),
      ConditionExpression: 'attribute_not_exists(PK)',
    });
  });

  test('refuses a second active slot for the same poster and subject', async () => {
    ddbMock.on(PutCommand).rejects(
      new ConditionalCheckFailedException({ message: 'The conditional request failed', $metadata: {} }),
    );

    const reserved = await reserveOneActivePaapaSlot('alice', 'bob', 'entry-2');

    expect(reserved).toBe(false);
  });

  test('propagates unexpected errors instead of silently returning false', async () => {
    ddbMock.on(PutCommand).rejects(new Error('network blip'));

    await expect(reserveOneActivePaapaSlot('alice', 'bob', 'entry-3')).rejects.toThrow('network blip');
  });
});

describe('releasePaapaSlot', () => {
  test('deletes the reservation marker for the given pair', async () => {
    ddbMock.on(DeleteCommand).resolves({});

    await releasePaapaSlot('alice', 'bob');

    expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: TABLE_NAME,
      Key: { PK: 'USER#alice', SK: 'RATE#PAAPA#bob' },
    });
  });
});

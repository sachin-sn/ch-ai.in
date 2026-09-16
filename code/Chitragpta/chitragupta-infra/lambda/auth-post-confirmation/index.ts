import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

// Creates the profile item and its search-index entry in one transaction.
// ledgerEnabled starts false: the opt-in consent model means no one's
// profile is publicly visible or accepting entries until they turn it on
// themselves via toggle-ledger.
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const username = event.userName;
  const email = event.request.userAttributes.email;

  await ddb.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${username}`,
              SK: 'PROFILE',
              username,
              email,
              ledgerEnabled: false,
              punyaCount: 0,
              paapaCount: 0,
              punyaSummary: '',
              paapaSummary: '',
            },
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: { PK: 'USERNAMES', SK: `NAME#${username.toLowerCase()}`, username },
            ConditionExpression: 'attribute_not_exists(SK)',
          },
        },
      ],
    }),
  );

  return event;
};

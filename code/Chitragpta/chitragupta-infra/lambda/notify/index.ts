import type { EventBridgeEvent } from 'aws-lambda';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';
import type { EntryType } from '../shared/types';

const ses = new SESv2Client({});
const FROM_ADDRESS = process.env.NOTIFY_FROM_ADDRESS ?? 'no-reply@chitragupta.ai';

interface Detail {
  subjectUsername: string;
  type: EntryType;
  entryId: string;
}

async function getEmailForUsername(username: string): Promise<string | undefined> {
  const result = await ddb.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${username}`, SK: 'PROFILE' } }),
  );
  return result.Item?.email as string | undefined;
}

export const handler = async (
  event: EventBridgeEvent<'PaapaPendingSubjectNotify' | 'EntryPublished', Detail>,
): Promise<void> => {
  const { subjectUsername, type } = event.detail;
  const email = await getEmailForUsername(subjectUsername);
  if (!email) return;

  const subject =
    event['detail-type'] === 'PaapaPendingSubjectNotify'
      ? 'A new paapa entry is pending on your ledger'
      : `A new ${type.toLowerCase()} entry was published on your ledger`;

  const body =
    event['detail-type'] === 'PaapaPendingSubjectNotify'
      ? 'Someone submitted a paapa entry about you. You have 72 hours to reply or report it before it publishes.'
      : subject;

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_ADDRESS,
      Destination: { ToAddresses: [email] },
      Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: body } } } },
    }),
  );
};

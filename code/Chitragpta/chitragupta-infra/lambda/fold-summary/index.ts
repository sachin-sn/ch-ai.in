import type { DynamoDBStreamHandler, DynamoDBRecord } from 'aws-lambda';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

const bedrock = new BedrockRuntimeClient({});
const MODEL_ID = process.env.SUMMARY_MODEL_ID ?? 'anthropic.claude-haiku-4-5-20251001-v1:0';

export function extractSubjectUsername(pk: string): string {
  return pk.replace(/^USER#/, '');
}

async function foldSummary(existingSummary: string, newEntryText: string, entryType: string): Promise<string> {
  const prompt = existingSummary
    ? `Existing ${entryType} summary: "${existingSummary}"\n\nFold this new entry into the summary in one short, neutral paragraph, without inventing anything the entries don't say: "${newEntryText}"`
    : `Summarize this ${entryType} entry in one short, neutral paragraph: "${newEntryText}"`;

  const result = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 200 },
    }),
  );

  const text = result.output?.message?.content?.[0]?.text;
  return text ?? existingSummary;
}

function isNewlyActiveLedgerEntry(record: DynamoDBRecord): boolean {
  if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') return false;
  const newImage = record.dynamodb?.NewImage;
  if (!newImage) return false;

  const item = unmarshall(newImage as Record<string, any>);
  if (typeof item.SK !== 'string' || !item.SK.startsWith('LEDGER#')) return false;
  if (item.status !== 'ACTIVE') return false;

  const oldImage = record.dynamodb?.OldImage;
  const wasAlreadyActive = oldImage ? unmarshall(oldImage as Record<string, any>).status === 'ACTIVE' : false;
  return !wasAlreadyActive;
}

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    if (!isNewlyActiveLedgerEntry(record)) continue;

    const item = unmarshall(record.dynamodb!.NewImage as Record<string, any>);
    const subjectUsername = extractSubjectUsername(item.PK);
    const countField = item.type === 'PUNYA' ? 'punyaCount' : 'paapaCount';
    const summaryField = item.type === 'PUNYA' ? 'punyaSummary' : 'paapaSummary';

    const profile = await ddb.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK: item.PK, SK: 'PROFILE' } }),
    );
    const existingSummary = (profile.Item?.[summaryField] as string) ?? '';

    const newSummary = await foldSummary(existingSummary, item.text, item.type);

    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: item.PK, SK: 'PROFILE' },
        UpdateExpression: `SET ${summaryField} = :summary, #cnt = if_not_exists(#cnt, :zero) + :one`,
        ExpressionAttributeNames: { '#cnt': countField },
        ExpressionAttributeValues: { ':summary': newSummary, ':zero': 0, ':one': 1 },
      }),
    );

    console.log(`Folded a new ${item.type} entry into ${subjectUsername}'s summary`);
  }
};

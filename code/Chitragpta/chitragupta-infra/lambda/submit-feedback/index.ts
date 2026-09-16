import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, ApplyGuardrailCommand } from '@aws-sdk/client-bedrock-runtime';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ulid } from 'ulid';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';
import { reserveOneActivePaapaSlot, releasePaapaSlot } from '../shared/rate-limit';
import type { EntryType } from '../shared/types';

const bedrock = new BedrockRuntimeClient({});
const sqs = new SQSClient({});

const GUARDRAIL_ID = process.env.GUARDRAIL_ID!;
const GUARDRAIL_VERSION = process.env.GUARDRAIL_VERSION ?? 'DRAFT';
const QUEUE_URL = process.env.MODERATION_QUEUE_URL!;

const MAX_CHARS = 500;
const PAAPA_PENDING_MS = 72 * 60 * 60 * 1000;

interface SubmitBody {
  subjectUsername: string;
  type: EntryType;
  text: string;
}

type ValidationResult = { ok: true; value: SubmitBody } | { ok: false; error: string };

// Pure by design — no AWS calls — so it can be unit tested without mocking anything.
export function validateBody(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Missing request body' };
  }
  const { subjectUsername, type, text } = body as Record<string, unknown>;

  if (typeof subjectUsername !== 'string' || subjectUsername.trim().length === 0) {
    return { ok: false, error: 'subjectUsername is required' };
  }
  if (type !== 'PUNYA' && type !== 'PAAPA') {
    return { ok: false, error: 'type must be PUNYA or PAAPA' };
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { ok: false, error: 'text is required' };
  }
  if (text.length > MAX_CHARS) {
    return { ok: false, error: `text must be ${MAX_CHARS} characters or fewer` };
  }
  return { ok: true, value: { subjectUsername: subjectUsername.trim(), type, text } };
}

function jsonResponse(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResultV2 {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const submitterId = event.requestContext.authorizer?.jwt?.claims?.username as string | undefined;
  if (!submitterId) {
    return jsonResponse(401, { error: 'Sign-in required' });
  }

  let rawBody: unknown;
  try {
    rawBody = event.body ? JSON.parse(event.body) : undefined;
  } catch {
    return jsonResponse(400, { error: 'Body must be valid JSON' });
  }

  const parsed = validateBody(rawBody);
  if (!parsed.ok) {
    return jsonResponse(400, { error: parsed.error });
  }
  const { subjectUsername, type, text } = parsed.value;

  if (subjectUsername === submitterId) {
    return jsonResponse(400, { error: 'You cannot submit an entry about yourself' });
  }

  const entryId = ulid();
  let reservedSlot = false;

  if (type === 'PAAPA') {
    reservedSlot = await reserveOneActivePaapaSlot(subjectUsername, submitterId, entryId);
    if (!reservedSlot) {
      return jsonResponse(409, { error: 'You already have an active paapa entry for this person' });
    }
  }

  try {
    const guardrailResult = await bedrock.send(
      new ApplyGuardrailCommand({
        guardrailIdentifier: GUARDRAIL_ID,
        guardrailVersion: GUARDRAIL_VERSION,
        source: 'INPUT',
        content: [{ text: { text } }],
      }),
    );

    if (guardrailResult.action === 'GUARDRAIL_INTERVENED') {
      if (reservedSlot) await releasePaapaSlot(subjectUsername, submitterId);
      return jsonResponse(422, {
        error: 'This text was flagged by our content check and was not submitted.',
      });
    }
  } catch (err) {
    if (reservedSlot) await releasePaapaSlot(subjectUsername, submitterId);
    throw err;
  }

  const now = new Date();
  const status = type === 'PAAPA' ? 'PENDING' : 'ACTIVE';
  const publishAt = type === 'PAAPA' ? new Date(now.getTime() + PAAPA_PENDING_MS) : undefined;

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${subjectUsername}`,
        SK: `LEDGER#${type}#${entryId}`,
        type,
        status,
        text,
        submitterId,
        createdAt: now.toISOString(),
        ...(publishAt
          ? { publishAt: publishAt.toISOString(), GSI2PK: 'PENDING_PAAPA', GSI2SK: publishAt.toISOString() }
          : {}),
        GSI1PK: `SUBMITTER#${submitterId}`,
        GSI1SK: now.toISOString(),
      },
    }),
  );

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({ subjectUsername, type, entryId, status }),
    }),
  );

  return jsonResponse(202, { entryId, status });
};

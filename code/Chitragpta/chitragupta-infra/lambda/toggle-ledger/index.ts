import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

// Lets a user flip their own "ledgerEnabled" flag. Off by default at signup
// (see auth-post-confirmation) — no one gets a public profile without
// explicitly turning it on.
export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const username = event.requestContext.authorizer?.jwt?.claims?.username as string | undefined;
  if (!username) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sign-in required' }) };
  }

  let enabled = false;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    enabled = Boolean(body.enabled);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body must be valid JSON' }) };
  }

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${username}`, SK: 'PROFILE' },
      UpdateExpression: 'SET ledgerEnabled = :enabled',
      ExpressionAttributeValues: { ':enabled': enabled },
    }),
  );

  return { statusCode: 200, body: JSON.stringify({ ledgerEnabled: enabled }) };
};

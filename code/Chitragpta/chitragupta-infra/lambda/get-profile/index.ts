import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

// This route has no API Gateway authorizer attached (the profile summary is
// public), so an Authorization header is optional. When present and valid,
// it tells us whether the caller IS this profile's owner, which unlocks the
// per-entry breakdown alongside the public counts/summaries.
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

async function getRequesterUsername(authHeader: string | undefined): Promise<string | undefined> {
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  try {
    const payload = await verifier.verify(authHeader.slice('Bearer '.length));
    return payload.username as string;
  } catch {
    return undefined;
  }
}

function jsonResponse(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResultV2 {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const username = event.pathParameters?.username;
  if (!username) {
    return jsonResponse(400, { error: 'username is required' });
  }

  const profile = await ddb.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${username}`, SK: 'PROFILE' } }),
  );

  if (!profile.Item || !profile.Item.ledgerEnabled) {
    return jsonResponse(404, { error: "This user hasn't opened their ledger" });
  }

  const requesterUsername = await getRequesterUsername(event.headers?.authorization);
  const isOwner = requesterUsername === username;

  const body: Record<string, unknown> = {
    username: profile.Item.username,
    punyaCount: profile.Item.punyaCount ?? 0,
    paapaCount: profile.Item.paapaCount ?? 0,
    punyaSummary: profile.Item.punyaSummary ?? '',
    paapaSummary: profile.Item.paapaSummary ?? '',
  };

  if (isOwner) {
    const ledger = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: { ':pk': `USER#${username}`, ':prefix': 'LEDGER#' },
        ScanIndexForward: false,
      }),
    );
    body.entries = ledger.Items ?? [];
  }

  return jsonResponse(200, body);
};

import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

// Flags an entry for human review — the replacement for "no delete, ever".
// This only records the report; a moderator (out of band, not shown here)
// later sets status to REMOVED_POLICY / REMOVED_LEGAL, or clears the flag.
export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const reporterId = event.requestContext.authorizer?.jwt?.claims?.username as string | undefined;
  if (!reporterId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sign-in required' }) };
  }

  const username = event.pathParameters?.username;
  const entrySk = event.pathParameters?.entrySk;
  if (!username || !entrySk) {
    return { statusCode: 400, body: JSON.stringify({ error: 'username and entry id are required' }) };
  }

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${username}`, SK: decodeURIComponent(entrySk) },
      UpdateExpression: 'SET reportedBy = list_append(if_not_exists(reportedBy, :empty), :reporter)',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: { ':empty': [], ':reporter': [reporterId] },
    }),
  );

  return { statusCode: 202, body: JSON.stringify({ reported: true }) };
};

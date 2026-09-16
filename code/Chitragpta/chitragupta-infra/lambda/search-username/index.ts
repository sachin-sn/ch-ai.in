import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../shared/dynamo-client';

const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 8;

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const q = (event.queryStringParameters?.q ?? '').trim();

  if (q.length < MIN_QUERY_LENGTH) {
    return { statusCode: 200, body: JSON.stringify({ suggestions: [] }) };
  }

  // Usernames are public/searchable by design, so a prefix match here isn't a
  // new information leak. This queries a dedicated USERNAMES partition
  // (PK='USERNAMES', SK=`NAME#<lowercased username>`) maintained by the
  // post-confirmation trigger, rather than scanning user profile items.
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': 'USERNAMES', ':prefix': `NAME#${q.toLowerCase()}` },
      Limit: MAX_SUGGESTIONS,
    }),
  );

  const suggestions = (result.Items ?? []).map((item) => item.username);
  return { statusCode: 200, body: JSON.stringify({ suggestions }) };
};

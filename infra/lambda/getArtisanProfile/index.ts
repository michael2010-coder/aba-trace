import type { APIGatewayProxyEvent } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE } from '../_shared/db';
import { json, HttpError, getCognitoSub } from '../_shared/http';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const cognitoSub = getCognitoSub(event);

    const result = await ddb.send(
      new QueryCommand({
        TableName: ARTISANS_TABLE,
        IndexName: 'CognitoSubIndex',
        KeyConditionExpression: 'cognitoSub = :sub',
        ExpressionAttributeValues: { ':sub': cognitoSub },
      })
    );

    const artisan = result.Items?.[0];
    if (!artisan) {
      throw new HttpError(404, 'Artisan profile not found. Complete registration first.');
    }

    return json(200, artisan);
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

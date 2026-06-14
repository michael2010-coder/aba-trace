import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE } from '../_shared/db';
import { json, HttpError, isAdmin } from '../_shared/http';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const artisanId = event.pathParameters?.artisanId;
    if (!artisanId) throw new HttpError(400, 'Missing artisanId');

    const body = JSON.parse(event.body || '{}');

    const existing = await ddb.send(new GetCommand({ TableName: ARTISANS_TABLE, Key: { artisanId } }));
    if (!existing.Item) throw new HttpError(404, 'Artisan not found');

    const approve = body.approve !== false; // default true (verify); pass { approve: false } to reject

    await ddb.send(
      new UpdateCommand({
        TableName: ARTISANS_TABLE,
        Key: { artisanId },
        UpdateExpression: 'SET ninVerified = :verified, ninVerificationMethod = :method',
        ExpressionAttributeValues: { ':verified': approve, ':method': 'manual' },
      })
    );

    return json(200, { artisanId, ninVerified: approve });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

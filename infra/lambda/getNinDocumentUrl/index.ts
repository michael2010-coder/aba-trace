import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ddb, ARTISANS_TABLE, NIN_UPLOADS_BUCKET } from '../_shared/db';
import { s3 } from '../_shared/s3';
import { json, HttpError, isAdmin } from '../_shared/http';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const artisanId = event.pathParameters?.artisanId;
    if (!artisanId) throw new HttpError(400, 'Missing artisanId');

    const existing = await ddb.send(new GetCommand({ TableName: ARTISANS_TABLE, Key: { artisanId } }));
    if (!existing.Item) throw new HttpError(404, 'Artisan not found');
    if (!existing.Item.ninDocumentKey) throw new HttpError(404, 'No NIN document uploaded for this artisan');

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: NIN_UPLOADS_BUCKET, Key: existing.Item.ninDocumentKey }),
      { expiresIn: 300 }
    );

    return json(200, { url });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

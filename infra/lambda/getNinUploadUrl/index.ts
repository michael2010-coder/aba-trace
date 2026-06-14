import type { APIGatewayProxyEvent } from 'aws-lambda';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ddb, ARTISANS_TABLE, NIN_UPLOADS_BUCKET } from '../_shared/db';
import { s3 } from '../_shared/s3';
import { json, HttpError, getCognitoSub } from '../_shared/http';

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

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

    const body = JSON.parse(event.body || '{}');
    const contentType = body.contentType;
    const extension = ALLOWED_CONTENT_TYPES[contentType];
    if (!extension) {
      throw new HttpError(400, `Unsupported contentType. Allowed: ${Object.keys(ALLOWED_CONTENT_TYPES).join(', ')}`);
    }

    const key = `${artisan.artisanId}/nin-slip.${extension}`;

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: NIN_UPLOADS_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 300 }
    );

    await ddb.send(
      new UpdateCommand({
        TableName: ARTISANS_TABLE,
        Key: { artisanId: artisan.artisanId },
        UpdateExpression: 'SET ninDocumentKey = :key',
        ExpressionAttributeValues: { ':key': key },
      })
    );

    return json(200, { uploadUrl, key });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

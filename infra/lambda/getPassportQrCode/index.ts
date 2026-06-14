import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ddb, ARTISANS_TABLE, PASSPORTS_TABLE, QR_CODES_BUCKET } from '../_shared/db';
import { s3 } from '../_shared/s3';
import { json, HttpError, getCognitoSub } from '../_shared/http';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const cognitoSub = getCognitoSub(event);
    const passportId = event.pathParameters?.passportId;
    if (!passportId) throw new HttpError(400, 'Missing passportId');

    const artisanResult = await ddb.send(
      new QueryCommand({
        TableName: ARTISANS_TABLE,
        IndexName: 'CognitoSubIndex',
        KeyConditionExpression: 'cognitoSub = :sub',
        ExpressionAttributeValues: { ':sub': cognitoSub },
      })
    );
    const artisan = artisanResult.Items?.[0];
    if (!artisan) throw new HttpError(404, 'Artisan profile not found. Complete registration first.');

    const passportResult = await ddb.send(new GetCommand({ TableName: PASSPORTS_TABLE, Key: { passportId } }));
    const passport = passportResult.Item;
    if (!passport) throw new HttpError(404, 'Passport not found');
    if (passport.artisanId !== artisan.artisanId) throw new HttpError(403, 'Not your passport');

    const qrCodeUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: QR_CODES_BUCKET, Key: passport.qrCodeS3Key }),
      { expiresIn: 3600 }
    );

    return json(200, { qrCodeUrl });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

import type { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ddb, ARTISANS_TABLE, PASSPORTS_TABLE, QR_CODES_BUCKET } from '../_shared/db';
import { json, HttpError, getCognitoSub } from '../_shared/http';
import { appendLedgerEntry } from '../_shared/ledger';

const s3 = new S3Client({});

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const cognitoSub = getCognitoSub(event);

    const artisanResult = await ddb.send(
      new QueryCommand({
        TableName: ARTISANS_TABLE,
        IndexName: 'CognitoSubIndex',
        KeyConditionExpression: 'cognitoSub = :sub',
        ExpressionAttributeValues: { ':sub': cognitoSub },
      })
    );
    const artisan = artisanResult.Items?.[0];
    if (!artisan) {
      throw new HttpError(404, 'Artisan profile not found. Complete registration first.');
    }

    const body = JSON.parse(event.body || '{}');
    const required = ['productName', 'batchId', 'materials', 'quantityInBatch'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        throw new HttpError(400, `Missing required field: ${field}`);
      }
    }

    const passportId = randomUUID();
    const issuedAt = new Date().toISOString();

    const ledgerEntry = await appendLedgerEntry(passportId, 'creation', {
      productName: body.productName,
      batchId: body.batchId,
      materials: body.materials,
      lgaOfOrigin: artisan.lga,
      artisanId: artisan.artisanId,
      issuedAt,
    });

    // Generate QR code pointing at the public passport view
    const publicUrl = `${process.env.PUBLIC_BASE_URL}/p/${passportId}`;
    const qrPng = await QRCode.toBuffer(publicUrl, { type: 'png', width: 400 });
    const qrCodeS3Key = `${passportId}.png`;
    await s3.send(
      new PutObjectCommand({
        Bucket: QR_CODES_BUCKET,
        Key: qrCodeS3Key,
        Body: qrPng,
        ContentType: 'image/png',
      })
    );

    const passport = {
      passportId,
      artisanId: artisan.artisanId,
      productName: body.productName,
      batchId: body.batchId,
      materials: body.materials,
      lgaOfOrigin: artisan.lga,
      quantityInBatch: body.quantityInBatch,
      issuedAt,
      ledgerEntrySequence: ledgerEntry.sequenceNumber,
      ledgerEntryId: ledgerEntry.entryId,
      qrCodeS3Key,
      status: 'active',
    };

    await ddb.send(new PutCommand({ TableName: PASSPORTS_TABLE, Item: passport }));

    const qrCodeUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: QR_CODES_BUCKET, Key: qrCodeS3Key }),
      { expiresIn: 3600 }
    );

    return json(201, { ...passport, qrCodeUrl, publicUrl });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

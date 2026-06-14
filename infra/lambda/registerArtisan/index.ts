import type { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE } from '../_shared/db';
import { json, HttpError, getCognitoSub } from '../_shared/http';

const VALID_LGAS = [
  'Aba North',
  'Aba South',
  'Arochukwu',
  'Bende',
  'Ikwuano',
  'Isiala Ngwa North',
  'Isiala Ngwa South',
  'Isuikwuato',
  'Obi Ngwa',
  'Ohafia',
  'Osisioma',
  'Ugwunagbo',
  'Ukwa East',
  'Ukwa West',
  'Umuahia North',
  'Umuahia South',
  'Umu Nneochi',
];

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const cognitoSub = getCognitoSub(event);

    const existing = await ddb.send(
      new QueryCommand({
        TableName: ARTISANS_TABLE,
        IndexName: 'CognitoSubIndex',
        KeyConditionExpression: 'cognitoSub = :sub',
        ExpressionAttributeValues: { ':sub': cognitoSub },
      })
    );
    if (existing.Items && existing.Items.length > 0) {
      throw new HttpError(409, 'Artisan profile already exists for this user');
    }

    const body = JSON.parse(event.body || '{}');
    const required = ['fullName', 'phoneNumber', 'ninNumber', 'lga', 'businessName', 'businessType'];
    for (const field of required) {
      if (!body[field]) {
        throw new HttpError(400, `Missing required field: ${field}`);
      }
    }
    if (!VALID_LGAS.includes(body.lga)) {
      throw new HttpError(400, `Invalid lga. Pilot supports: ${VALID_LGAS.join(', ')}`);
    }

    const artisan = {
      artisanId: randomUUID(),
      fullName: body.fullName,
      phoneNumber: body.phoneNumber,
      ninNumber: body.ninNumber,
      ninVerified: false,
      lga: body.lga,
      businessName: body.businessName,
      businessType: body.businessType,
      materialsUsed: Array.isArray(body.materialsUsed) ? body.materialsUsed : [],
      ninDocumentKey: null as string | null,
      registeredAt: new Date().toISOString(),
      cognitoSub,
    };

    await ddb.send(new PutCommand({ TableName: ARTISANS_TABLE, Item: artisan }));

    return json(201, artisan);
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

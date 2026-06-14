import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE, PASSPORTS_TABLE } from '../_shared/db';
import { json, HttpError } from '../_shared/http';
import { getLedgerEntriesForPassport } from '../_shared/ledger';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const passportId = event.pathParameters?.passportId;
    if (!passportId) throw new HttpError(400, 'Missing passportId');

    const passportResult = await ddb.send(
      new GetCommand({ TableName: PASSPORTS_TABLE, Key: { passportId } })
    );
    const passport = passportResult.Item;
    if (!passport) throw new HttpError(404, 'Passport not found');

    const artisanResult = await ddb.send(
      new GetCommand({ TableName: ARTISANS_TABLE, Key: { artisanId: passport.artisanId } })
    );
    const artisan = artisanResult.Item;

    const entries = await getLedgerEntriesForPassport(passportId);
    const creationEntry = entries.find((e) => e.entryType === 'creation');
    const amendmentEntries = entries.filter((e) => e.entryType === 'amendment');

    return json(200, {
      passportId: passport.passportId,
      productName: passport.productName,
      batchId: passport.batchId,
      materials: passport.materials,
      lgaOfOrigin: passport.lgaOfOrigin,
      quantityInBatch: passport.quantityInBatch,
      issuedAt: passport.issuedAt,
      status: passport.status,
      makerName: artisan?.businessName || artisan?.fullName,
      original: creationEntry?.payload,
      amendments: amendmentEntries.map((e) => ({
        entryId: e.entryId,
        createdAt: e.createdAt,
        payload: e.payload,
      })),
    });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

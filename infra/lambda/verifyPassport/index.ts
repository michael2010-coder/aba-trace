import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, PASSPORTS_TABLE } from '../_shared/db';
import { json, HttpError } from '../_shared/http';
import { getLedgerEntriesForPassport, verifyEntryHashes } from '../_shared/ledger';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const passportId = event.pathParameters?.passportId;
    if (!passportId) throw new HttpError(400, 'Missing passportId');

    const passportResult = await ddb.send(
      new GetCommand({ TableName: PASSPORTS_TABLE, Key: { passportId } })
    );
    if (!passportResult.Item) throw new HttpError(404, 'Passport not found');

    const entries = await getLedgerEntriesForPassport(passportId);
    const result = verifyEntryHashes(entries);

    const creationEntry = entries.find((e) => e.entryType === 'creation');
    const amendmentEntries = entries.filter((e) => e.entryType === 'amendment');

    return json(200, {
      ...result,
      createdAt: creationEntry?.createdAt,
      amended: amendmentEntries.length > 0,
      amendments: amendmentEntries.map((e) => ({ createdAt: e.createdAt, reason: e.payload?.reason })),
    });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

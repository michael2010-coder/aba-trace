import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, PASSPORTS_TABLE } from '../_shared/db';
import { json, HttpError, isAdmin } from '../_shared/http';
import { appendLedgerEntry } from '../_shared/ledger';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const passportId = event.pathParameters?.passportId;
    if (!passportId) throw new HttpError(400, 'Missing passportId');

    const body = JSON.parse(event.body || '{}');
    if (!body.reason || !body.changes || typeof body.changes !== 'object') {
      throw new HttpError(400, 'Request must include "reason" and "changes" (object of corrected fields)');
    }

    const passportResult = await ddb.send(
      new GetCommand({ TableName: PASSPORTS_TABLE, Key: { passportId } })
    );
    const passport = passportResult.Item;
    if (!passport) throw new HttpError(404, 'Passport not found');

    const ledgerEntry = await appendLedgerEntry(passportId, 'amendment', {
      originalEntryId: passport.ledgerEntryId,
      reason: body.reason,
      changes: body.changes,
    });

    await ddb.send(
      new UpdateCommand({
        TableName: PASSPORTS_TABLE,
        Key: { passportId },
        UpdateExpression:
          'SET #status = :amended, amendmentLedgerEntryId = :entryId, amendmentReason = :reason',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':amended': 'amended',
          ':entryId': ledgerEntry.entryId,
          ':reason': body.reason,
        },
      })
    );

    return json(200, { passportId, status: 'amended', amendmentLedgerEntryId: ledgerEntry.entryId });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

import type { APIGatewayProxyEvent } from 'aws-lambda';
import { json, HttpError, isAdmin } from '../_shared/http';
import { getAllLedgerEntries, verifyChain } from '../_shared/ledger';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const entries = await getAllLedgerEntries();
    const result = verifyChain(entries);

    return json(200, result);
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

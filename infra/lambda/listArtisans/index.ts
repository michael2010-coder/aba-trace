import type { APIGatewayProxyEvent } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE } from '../_shared/db';
import { json, HttpError, isAdmin } from '../_shared/http';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const items: Record<string, unknown>[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const result = await ddb.send(new ScanCommand({ TableName: ARTISANS_TABLE, ExclusiveStartKey }));
      items.push(...(result.Items ?? []));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    const pendingNin = items.filter((i) => !i.ninVerified);

    return json(200, { artisans: items, pendingNinVerification: pendingNin });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

import type { APIGatewayProxyEvent } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, ARTISANS_TABLE, PASSPORTS_TABLE } from '../_shared/db';
import { json, HttpError, isAdmin } from '../_shared/http';

async function scanAll(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await ddb.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!isAdmin(event)) throw new HttpError(403, 'Admin access required');

    const [artisans, passports] = await Promise.all([
      scanAll(ARTISANS_TABLE),
      scanAll(PASSPORTS_TABLE),
    ]);

    const byLga: Record<string, number> = {};
    for (const artisan of artisans) {
      const lga = String(artisan.lga ?? 'Unknown');
      byLga[lga] = (byLga[lga] ?? 0) + 1;
    }

    return json(200, {
      artisansRegistered: artisans.length,
      artisansNinVerified: artisans.filter((a) => a.ninVerified).length,
      passportsIssued: passports.length,
      passportsAmended: passports.filter((p) => p.status === 'amended').length,
      artisansByLga: byLga,
    });
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    console.error(err);
    return json(500, { error: 'Internal server error' });
  }
};

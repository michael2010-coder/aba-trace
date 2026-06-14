import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client);

export const ARTISANS_TABLE = process.env.ARTISANS_TABLE!;
export const PASSPORTS_TABLE = process.env.PASSPORTS_TABLE!;
export const LEDGER_TABLE = process.env.LEDGER_TABLE!;
export const QR_CODES_BUCKET = process.env.QR_CODES_BUCKET!;
export const NIN_UPLOADS_BUCKET = process.env.NIN_UPLOADS_BUCKET!;

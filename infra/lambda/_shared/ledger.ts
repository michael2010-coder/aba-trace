import { createHash, randomUUID } from 'crypto';
import { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, LEDGER_TABLE } from './db';

export const GENESIS_HASH = '0'.repeat(64);
const COUNTER_KEY = { sequenceNumber: -1 };

/**
 * JSON.stringify with object keys sorted recursively. DynamoDB maps don't
 * preserve key insertion order, so hashing must not depend on it either.
 */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function computeSelfHash(params: {
  sequenceNumber: number;
  entryId: string;
  passportId: string;
  entryType: string;
  payload: unknown;
  previousHash: string;
}): string {
  const { sequenceNumber, entryId, passportId, entryType, payload, previousHash } = params;
  const content = `${sequenceNumber}${entryId}${passportId}${entryType}${canonicalJson(payload)}${previousHash}`;
  return createHash('sha256').update(content).digest('hex');
}

export interface LedgerEntry {
  sequenceNumber: number;
  entryId: string;
  passportId: string;
  entryType: 'creation' | 'amendment';
  payload: Record<string, unknown>;
  previousHash: string;
  selfHash: string;
  createdAt: string;
}

/**
 * Appends a new entry to the hash-chain ledger, deriving previousHash from the
 * highest existing sequenceNumber. A single counter item (sequenceNumber: -1)
 * is used with a conditional write to serialize sequence allocation.
 */
export async function appendLedgerEntry(
  passportId: string,
  entryType: 'creation' | 'amendment',
  payload: Record<string, unknown>
): Promise<LedgerEntry> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const counter = await ddb.send(new GetCommand({ TableName: LEDGER_TABLE, Key: COUNTER_KEY }));
    const nextSequence: number = counter.Item?.nextSequence ?? 0;
    const lastSelfHash: string = counter.Item?.lastSelfHash ?? GENESIS_HASH;

    const entryId = randomUUID();
    const createdAt = new Date().toISOString();
    const previousHash = lastSelfHash;
    const selfHash = computeSelfHash({
      sequenceNumber: nextSequence,
      entryId,
      passportId,
      entryType,
      payload,
      previousHash,
    });

    const entry: LedgerEntry = {
      sequenceNumber: nextSequence,
      entryId,
      passportId,
      entryType,
      payload,
      previousHash,
      selfHash,
      createdAt,
    };

    try {
      await ddb.send(
        new UpdateCommand({
          TableName: LEDGER_TABLE,
          Key: COUNTER_KEY,
          UpdateExpression: 'SET nextSequence = :next, lastSelfHash = :hash',
          ConditionExpression:
            'attribute_not_exists(nextSequence) OR nextSequence = :expected',
          ExpressionAttributeValues: {
            ':next': nextSequence + 1,
            ':hash': selfHash,
            ':expected': nextSequence,
          },
        })
      );
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') {
        continue; // another writer won the race; retry with fresh sequence
      }
      throw err;
    }

    await ddb.send(new PutCommand({ TableName: LEDGER_TABLE, Item: entry }));
    return entry;
  }

  throw new Error('Failed to append ledger entry after retries (sequence contention)');
}

export async function getLedgerEntriesForPassport(passportId: string): Promise<LedgerEntry[]> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: LEDGER_TABLE,
      IndexName: 'PassportIdIndex',
      KeyConditionExpression: 'passportId = :pid',
      ExpressionAttributeValues: { ':pid': passportId },
      ScanIndexForward: true,
    })
  );
  return (result.Items as LedgerEntry[]) ?? [];
}

export async function getAllLedgerEntries(): Promise<LedgerEntry[]> {
  const items: LedgerEntry[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await ddb.send(
      new ScanCommand({
        TableName: LEDGER_TABLE,
        FilterExpression: 'sequenceNumber >= :zero',
        ExpressionAttributeValues: { ':zero': 0 },
        ExclusiveStartKey,
      })
    );
    items.push(...((result.Items as LedgerEntry[]) ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}

export interface ChainVerificationResult {
  valid: boolean;
  entriesChecked: number;
  brokenAtSequence?: number;
}

export function verifyChain(entries: LedgerEntry[]): ChainVerificationResult {
  let expectedPreviousHash = GENESIS_HASH;
  for (const entry of entries) {
    const recomputed = computeSelfHash(entry);
    if (recomputed !== entry.selfHash || entry.previousHash !== expectedPreviousHash) {
      return { valid: false, entriesChecked: entries.length, brokenAtSequence: entry.sequenceNumber };
    }
    expectedPreviousHash = entry.selfHash;
  }
  return { valid: true, entriesChecked: entries.length };
}

/**
 * Verifies that each entry's selfHash matches its recomputed content hash.
 * Unlike verifyChain, this does not require the first entry to follow the
 * genesis hash, since a passport's entries are typically a subset of the
 * global ledger sequence (their previousHash links to other passports'
 * entries earlier in the global chain).
 */
export function verifyEntryHashes(entries: LedgerEntry[]): ChainVerificationResult {
  for (const entry of entries) {
    if (computeSelfHash(entry) !== entry.selfHash) {
      return { valid: false, entriesChecked: entries.length, brokenAtSequence: entry.sequenceNumber };
    }
  }
  return { valid: true, entriesChecked: entries.length };
}

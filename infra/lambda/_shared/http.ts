import type { APIGatewayProxyResult } from 'aws-lambda';

export function json(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function getCognitoSub(event: { requestContext: any }): string {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? event.requestContext?.authorizer?.claims;
  const sub = claims?.sub;
  if (!sub) {
    throw new HttpError(401, 'Missing Cognito identity in request');
  }
  return sub;
}

export function isAdmin(event: { requestContext: any }): boolean {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? event.requestContext?.authorizer?.claims;
  const groups = claims?.['cognito:groups'];
  if (!groups) return false;
  if (Array.isArray(groups)) return groups.includes('Admins');
  // API Gateway HTTP API JWT authorizers serialize array claims as "[Admins, Other]"
  return String(groups)
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((g) => g.trim())
    .includes('Admins');
}

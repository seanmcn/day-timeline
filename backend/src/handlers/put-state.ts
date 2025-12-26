import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getObject, putObject } from '../lib/s3-client.js';
import { success, error } from '../lib/response.js';
import { extractAuthContext } from '../lib/auth.js';
import type { DayState } from '@day-timeline/shared';

function validateState(
  state: unknown
): state is Omit<DayState, 'userId' | 'createdAt'> {
  if (!state || typeof state !== 'object') return false;

  const s = state as Record<string, unknown>;

  if (s.version !== 1) return false;
  if (typeof s.date !== 'string') return false;
  if (s.dayStartAt !== null && typeof s.dayStartAt !== 'string') return false;
  if (!Array.isArray(s.blocks)) return false;

  for (const block of s.blocks) {
    if (!block.id || !block.type || !block.label) return false;
    if (typeof block.estimateMinutes !== 'number') return false;
    if (!Array.isArray(block.sessions)) return false;
  }

  return true;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Handle CORS preflight
  if (event.requestContext.http.method === 'OPTIONS') {
    return success({});
  }

  const auth = extractAuthContext(event);
  if (!auth) {
    return error(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const date = event.queryStringParameters?.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return error(
      400,
      'INVALID_DATE',
      'Date parameter required in YYYY-MM-DD format'
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return error(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  if (!validateState(body)) {
    return error(400, 'INVALID_STATE', 'Invalid day state structure');
  }

  const stateKey = `users/${auth.userId}/state/${date}.json`;

  try {
    // Get existing state to preserve createdAt
    const existing = await getObject<DayState>(stateKey);

    const state: DayState = {
      ...body,
      userId: auth.userId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await putObject(stateKey, state);

    return success(state);
  } catch (err) {
    console.error('Error saving state:', err);
    return error(500, 'INTERNAL_ERROR', 'Failed to save day state');
  }
};

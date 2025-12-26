import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getObject, putObject } from '../lib/s3-client.js';
import { success, error } from '../lib/response.js';
import { extractAuthContext } from '../lib/auth.js';
import {
  type DayState,
  type DayTemplate,
  createDefaultDayState,
} from '@day-timeline/shared';

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

  const stateKey = `users/${auth.userId}/state/${date}.json`;

  try {
    // Try to get existing state
    let state = await getObject<DayState>(stateKey);

    if (!state) {
      // Try to load from user's template
      const templateKey = `users/${auth.userId}/template.json`;
      const template = await getObject<DayTemplate>(templateKey);

      if (template) {
        // Create state from template
        state = {
          version: 1,
          date,
          userId: auth.userId,
          dayStartAt: null,
          blocks: template.blocks.map((b) => ({ ...b, sessions: [] })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create default state
        state = createDefaultDayState(auth.userId, date);
      }

      // Save the new state
      await putObject(stateKey, state);
    }

    return success(state);
  } catch (err) {
    console.error('Error getting state:', err);
    return error(500, 'INTERNAL_ERROR', 'Failed to retrieve day state');
  }
};

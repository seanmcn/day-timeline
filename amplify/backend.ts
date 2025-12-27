import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Day Timeline Backend
 *
 * Uses Amplify Data (AppSync + DynamoDB) for storage
 * and Amplify Auth (Cognito) for authentication.
 */
const backend = defineBackend({
  auth,
  data,
});

export { backend };

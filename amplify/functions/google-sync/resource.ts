import { defineFunction, secret } from '@aws-amplify/backend';

export const googleSyncFunc = defineFunction({
  name: 'google-sync',
  resourceGroupName: 'data',
  environment: {
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
  },
});

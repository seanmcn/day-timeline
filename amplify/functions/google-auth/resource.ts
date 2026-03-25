import { defineFunction, secret } from '@aws-amplify/backend';

export const googleAuthFunc = defineFunction({
  name: 'google-auth',
  resourceGroupName: 'data',
  environment: {
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
  },
});

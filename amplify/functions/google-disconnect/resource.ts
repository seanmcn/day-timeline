import { defineFunction } from '@aws-amplify/backend';

export const googleDisconnectFunc = defineFunction({
  name: 'google-disconnect',
  resourceGroupName: 'data',
});

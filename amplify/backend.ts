import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { googleAuthFunc } from './functions/google-auth/resource';
import { googleSyncFunc } from './functions/google-sync/resource';
import { googleDisconnectFunc } from './functions/google-disconnect/resource';

const backend = defineBackend({
  auth,
  data,
  googleAuthFunc,
  googleSyncFunc,
  googleDisconnectFunc,
});

// In production (has AWS_BRANCH), disable self-signup
if (process.env.AWS_BRANCH) {
  const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
  cfnUserPool.adminCreateUserConfig = {
    allowAdminCreateUserOnly: true,
  };
}

// Grant Lambda functions access to the UserGoogleTokens DynamoDB table
const tokensTable = backend.data.resources.tables['UserGoogleTokens'];
const tableName = tokensTable.tableName;

// Set table name as environment variable and grant read/write access
for (const func of [backend.googleAuthFunc, backend.googleSyncFunc, backend.googleDisconnectFunc]) {
  // addEnvironment exists on the concrete Function class; Amplify exposes IFunction
  (func.resources.lambda as any).addEnvironment('TOKENS_TABLE_NAME', tableName);
  tokensTable.grantReadWriteData(func.resources.lambda);
}

// Tag all resources for AWS Cost Explorer filtering
const environment = process.env.AWS_BRANCH ? 'production' : 'sandbox';
Tags.of(backend.stack).add('project', 'day-timeline');
Tags.of(backend.stack).add('environment', environment);

export { backend };

import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  DayState: a
    .model({
      date: a.string().required(), // YYYY-MM-DD format
      version: a.integer().default(1),
      dayStartAt: a.string(), // ISO 8601 UTC or null
      blocks: a.json(), // Block[] stored as JSON
    })
    .secondaryIndexes((index) => [index('date')])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { googleAuthFunc } from '../functions/google-auth/resource';
import { googleSyncFunc } from '../functions/google-sync/resource';
import { googleDisconnectFunc } from '../functions/google-disconnect/resource';

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

  UserTemplates: a
    .model({
      version: a.integer().default(1),
      templates: a.json(), // BlockTemplate[] stored as JSON
    })
    .authorization((allow) => [allow.owner()]),

  UserCategories: a
    .model({
      version: a.integer().default(1),
      categories: a.json(), // Category[] stored as JSON
    })
    .authorization((allow) => [allow.owner()]),

  UserGoogleTokens: a
    .model({
      refreshToken: a.string().required(),
      email: a.string(),
      connectedAt: a.string(),
      defaultCalendarCategory: a.string(), // Category ID for calendar events
      defaultTaskCategory: a.string(), // Category ID for Google Tasks
    })
    .authorization((allow) => [allow.owner()]),

  // Custom types for Google integration responses
  GoogleAuthResult: a.customType({
    success: a.boolean().required(),
    email: a.string(),
    error: a.string(),
  }),

  GoogleCalendarEvent: a.customType({
    id: a.string().required(),
    summary: a.string().required(),
    startTime: a.string().required(),
    endTime: a.string().required(),
  }),

  GoogleTaskItem: a.customType({
    id: a.string().required(),
    title: a.string().required(),
    notes: a.string(),
  }),

  GoogleSyncResult: a.customType({
    success: a.boolean().required(),
    events: a.ref('GoogleCalendarEvent').required().array().required(),
    tasks: a.ref('GoogleTaskItem').required().array().required(),
    error: a.string(),
  }),

  GoogleDisconnectResult: a.customType({
    success: a.boolean().required(),
    error: a.string(),
  }),

  // Custom operations backed by Lambda functions
  googleAuthExchange: a
    .mutation()
    .arguments({
      code: a.string().required(),
      redirectUri: a.string().required(),
    })
    .returns(a.ref('GoogleAuthResult'))
    .handler(a.handler.function(googleAuthFunc))
    .authorization((allow) => [allow.authenticated()]),

  googleSync: a
    .query()
    .arguments({
      date: a.string().required(),
    })
    .returns(a.ref('GoogleSyncResult'))
    .handler(a.handler.function(googleSyncFunc))
    .authorization((allow) => [allow.authenticated()]),

  googleDisconnect: a
    .mutation()
    .returns(a.ref('GoogleDisconnectResult'))
    .handler(a.handler.function(googleDisconnectFunc))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

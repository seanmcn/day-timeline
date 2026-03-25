import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TOKENS_TABLE = process.env.TOKENS_TABLE_NAME!;

type CognitoIdentity = { sub: string; username: string };

export const handler: Schema['googleAuthExchange']['functionHandler'] = async (
  event
) => {
  const { code, redirectUri } = event.arguments;
  const identity = event.identity as unknown as CognitoIdentity;
  const owner = `${identity.sub}::${identity.username}`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.refresh_token) {
      return {
        success: false,
        email: null,
        error: tokenData.error_description ?? 'Failed to exchange authorization code',
      };
    }

    // Decode the ID token to get the user's email (JWT payload is base64url encoded)
    let email = '';
    if (tokenData.id_token) {
      const payload = JSON.parse(
        Buffer.from(tokenData.id_token.split('.')[1], 'base64url').toString()
      );
      email = payload.email ?? '';
    }

    // Check if record already exists for this owner
    const existing = await ddb.send(
      new ScanCommand({
        TableName: TOKENS_TABLE,
        FilterExpression: '#owner = :owner',
        ExpressionAttributeNames: { '#owner': 'owner' },
        ExpressionAttributeValues: { ':owner': owner },
      })
    );

    const now = new Date().toISOString();
    const id = existing.Items?.[0]?.id ?? `google-${identity.sub}`;

    await ddb.send(
      new PutCommand({
        TableName: TOKENS_TABLE,
        Item: {
          id,
          owner,
          __typename: 'UserGoogleTokens',
          refreshToken: tokenData.refresh_token,
          email,
          connectedAt: existing.Items?.[0]?.connectedAt ?? now,
          defaultCalendarCategory: existing.Items?.[0]?.defaultCalendarCategory ?? null,
          defaultTaskCategory: existing.Items?.[0]?.defaultTaskCategory ?? null,
          createdAt: existing.Items?.[0]?.createdAt ?? now,
          updatedAt: now,
        },
      })
    );

    return { success: true, email, error: null };
  } catch (err: any) {
    console.error('Google auth exchange error:', err);
    return {
      success: false,
      email: null,
      error: err.message ?? 'Internal error',
    };
  }
};

import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TOKENS_TABLE = process.env.TOKENS_TABLE_NAME!;

type CognitoIdentity = { sub: string; username: string };

export const handler: Schema['googleDisconnect']['functionHandler'] = async (
  event
) => {
  const identity = event.identity as unknown as CognitoIdentity;
  const owner = `${identity.sub}::${identity.username}`;

  try {
    // Find the user's token record
    const result = await ddb.send(
      new ScanCommand({
        TableName: TOKENS_TABLE,
        FilterExpression: '#owner = :owner',
        ExpressionAttributeNames: { '#owner': 'owner' },
        ExpressionAttributeValues: { ':owner': owner },
      })
    );

    const record = result.Items?.[0];
    if (!record) {
      return { success: true, error: null };
    }

    // Revoke the refresh token with Google
    if (record.refreshToken) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${record.refreshToken}`,
          { method: 'POST' }
        );
      } catch {
        // Revocation failure is non-critical
      }
    }

    // Delete the DynamoDB record
    await ddb.send(
      new DeleteCommand({
        TableName: TOKENS_TABLE,
        Key: { id: record.id },
      })
    );

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Google disconnect error:', err);
    return { success: false, error: err.message ?? 'Disconnect failed' };
  }
};

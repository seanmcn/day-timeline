import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TOKENS_TABLE = process.env.TOKENS_TABLE_NAME!;

type CognitoIdentity = { sub: string; username: string };

interface GoogleCalendarApiEvent {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  status?: string;
}

interface GoogleTaskApiItem {
  id: string;
  title: string;
  notes?: string;
  status: string;
  due?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
}

interface TaskItem {
  id: string;
  title: string;
  notes: string | null;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description ?? 'Failed to refresh access token');
  }
  return data.access_token;
}

async function fetchCalendarEvents(
  accessToken: string,
  date: string
): Promise<CalendarEvent[]> {
  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Calendar API error: ${err}`);
  }

  const data = await response.json();
  const events: CalendarEvent[] = [];

  for (const item of (data.items ?? []) as GoogleCalendarApiEvent[]) {
    // Skip all-day events (they have start.date instead of start.dateTime)
    if (!item.start?.dateTime || !item.end?.dateTime) continue;
    // Skip cancelled events
    if (item.status === 'cancelled') continue;

    events.push({
      id: item.id,
      summary: item.summary ?? '(No title)',
      startTime: item.start.dateTime,
      endTime: item.end.dateTime,
    });
  }

  return events;
}

async function fetchTasks(accessToken: string): Promise<TaskItem[]> {
  const params = new URLSearchParams({
    showCompleted: 'false',
    showHidden: 'false',
    maxResults: '100',
  });

  const response = await fetch(
    `https://www.googleapis.com/tasks/v1/lists/@default/tasks?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    // Tasks API may not be enabled or user may have no task lists
    if (response.status === 404) return [];
    const err = await response.text();
    throw new Error(`Tasks API error: ${err}`);
  }

  const data = await response.json();
  const tasks: TaskItem[] = [];

  for (const item of (data.items ?? []) as GoogleTaskApiItem[]) {
    if (!item.title?.trim()) continue;

    tasks.push({
      id: item.id,
      title: item.title,
      notes: item.notes ?? null,
    });
  }

  return tasks;
}

export const handler: Schema['googleSync']['functionHandler'] = async (
  event
) => {
  const { date } = event.arguments;
  const identity = event.identity as unknown as CognitoIdentity;
  const owner = `${identity.sub}::${identity.username}`;

  try {
    // Look up stored refresh token
    const result = await ddb.send(
      new ScanCommand({
        TableName: TOKENS_TABLE,
        FilterExpression: '#owner = :owner',
        ExpressionAttributeNames: { '#owner': 'owner' },
        ExpressionAttributeValues: { ':owner': owner },
      })
    );

    const record = result.Items?.[0];
    if (!record?.refreshToken) {
      return {
        success: false,
        events: [],
        tasks: [],
        error: 'Google account not connected',
      };
    }

    // Get fresh access token
    const accessToken = await refreshAccessToken(record.refreshToken as string);

    // Fetch calendar events and tasks in parallel
    const [events, tasks] = await Promise.all([
      fetchCalendarEvents(accessToken, date),
      fetchTasks(accessToken),
    ]);

    return { success: true, events, tasks, error: null };
  } catch (err: any) {
    console.error('Google sync error:', err);
    return {
      success: false,
      events: [],
      tasks: [],
      error: err.message ?? 'Sync failed',
    };
  }
};

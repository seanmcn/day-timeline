import type { DayState, ApiResponse } from '@day-timeline/shared';

const API_BASE = import.meta.env.VITE_API_ENDPOINT || '/api';
const DEV_USER_ID = 'dev-user-001';

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add dev user header for local development
  if (import.meta.env.DEV) {
    headers['X-Dev-User-Id'] = DEV_USER_ID;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data as T;
}

export const api = {
  getState: (date: string): Promise<DayState> =>
    request<DayState>('GET', `/state?date=${date}`),

  putState: (date: string, state: DayState): Promise<DayState> =>
    request<DayState>('PUT', `/state?date=${date}`, state),
};

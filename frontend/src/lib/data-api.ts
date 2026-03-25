import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import type { DayState, Block, UserTemplates, BlockTemplate, UserCategories, Category, GoogleCalendarEvent, GoogleTaskItem } from '@day-timeline/shared';
import { authService } from './auth-service';

const client = generateClient<Schema>();

export type DayStateSubscription = {
  unsubscribe: () => void;
};

export const dataApi = {
  /**
   * Get the day state for a specific date.
   * Creates a default state if none exists.
   * Owner filtering is handled automatically by Amplify.
   */
  async getState(date: string): Promise<DayState> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // List with date filter - owner is automatically filtered by Amplify
    const { data, errors } = await client.models.DayState.list({
      filter: { date: { eq: date } },
    });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    // Should be at most one record per owner per date
    const record = data[0];

    if (record) {
      const blocks = typeof record.blocks === 'string'
        ? JSON.parse(record.blocks)
        : (record.blocks ?? []);
      return {
        version: 1 as const,
        date: record.date,
        userId: user.id, // Get from auth context
        dayStartAt: record.dayStartAt ?? null,
        blocks: blocks as Block[],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    }

    // Create default state if none exists, using user's templates
    const userTemplates = await this.getTemplates();
    const { createDefaultDayState } = await import('@day-timeline/shared');
    const defaultState = createDefaultDayState(user.id, date, userTemplates.templates);
    return this.putState(date, defaultState);
  },

  /**
   * Save the day state for a specific date.
   * Owner is automatically set by Amplify on create.
   */
  async putState(date: string, state: DayState): Promise<DayState> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if record exists for this date
    const { data: existing } = await client.models.DayState.list({
      filter: { date: { eq: date } },
    });

    const record = existing[0];

    let result;
    if (record) {
      // Update existing record by id
      const { data, errors } = await client.models.DayState.update({
        id: record.id,
        date,
        version: 1,
        dayStartAt: state.dayStartAt,
        blocks: JSON.stringify(state.blocks),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    } else {
      // Create new record (owner auto-set by Amplify)
      const { data, errors } = await client.models.DayState.create({
        date,
        version: 1,
        dayStartAt: state.dayStartAt,
        blocks: JSON.stringify(state.blocks),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    }

    if (!result) {
      throw new Error('Failed to save state');
    }

    const blocks = typeof result.blocks === 'string'
      ? JSON.parse(result.blocks)
      : (result.blocks ?? []);
    return {
      version: 1 as const,
      date: result.date,
      userId: user.id, // Get from auth context
      dayStartAt: result.dayStartAt ?? null,
      blocks: blocks as Block[],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  /**
   * Get user's block templates.
   * Creates default templates if none exist.
   */
  async getTemplates(): Promise<UserTemplates> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, errors } = await client.models.UserTemplates.list();

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    // Should be at most one record per owner
    const record = data[0];

    if (record) {
      const templates = typeof record.templates === 'string'
        ? JSON.parse(record.templates)
        : (record.templates ?? []);
      return {
        version: 1 as const,
        userId: user.id,
        templates: templates as BlockTemplate[],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    }

    // Create default templates for new user
    const { createDefaultUserTemplates } = await import('@day-timeline/shared');
    const defaultTemplates = createDefaultUserTemplates(user.id);
    return this.putTemplates(defaultTemplates);
  },

  /**
   * Delete the day state for a specific date.
   */
  async deleteState(date: string): Promise<void> {
    const { data: existing } = await client.models.DayState.list({
      filter: { date: { eq: date } },
    });

    const record = existing[0];
    if (record) {
      await client.models.DayState.delete({ id: record.id });
    }
  },

  /**
   * Save user's block templates.
   */
  async putTemplates(templates: UserTemplates): Promise<UserTemplates> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if record exists
    const { data: existing } = await client.models.UserTemplates.list();
    const record = existing[0];

    let result;
    if (record) {
      const { data, errors } = await client.models.UserTemplates.update({
        id: record.id,
        version: 1,
        templates: JSON.stringify(templates.templates),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    } else {
      const { data, errors } = await client.models.UserTemplates.create({
        version: 1,
        templates: JSON.stringify(templates.templates),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    }

    if (!result) {
      throw new Error('Failed to save templates');
    }

    const parsedTemplates = typeof result.templates === 'string'
      ? JSON.parse(result.templates)
      : (result.templates ?? []);
    return {
      version: 1 as const,
      userId: user.id,
      templates: parsedTemplates as BlockTemplate[],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  /**
   * Get user's categories.
   * Creates default categories if none exist.
   */
  async getCategories(): Promise<UserCategories> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, errors } = await client.models.UserCategories.list();

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    // Should be at most one record per owner
    const record = data[0];

    if (record) {
      const categories = typeof record.categories === 'string'
        ? JSON.parse(record.categories)
        : (record.categories ?? []);
      return {
        version: 1 as const,
        userId: user.id,
        categories: categories as Category[],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    }

    // Create default categories for new user
    const { createDefaultUserCategories } = await import('@day-timeline/shared');
    const defaultCategories = createDefaultUserCategories(user.id);
    return this.putCategories(defaultCategories);
  },

  /**
   * Save user's categories.
   */
  async putCategories(categories: UserCategories): Promise<UserCategories> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if record exists
    const { data: existing } = await client.models.UserCategories.list();
    const record = existing[0];

    let result;
    if (record) {
      const { data, errors } = await client.models.UserCategories.update({
        id: record.id,
        version: 1,
        categories: JSON.stringify(categories.categories),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    } else {
      const { data, errors } = await client.models.UserCategories.create({
        version: 1,
        categories: JSON.stringify(categories.categories),
      });
      if (errors?.length) throw new Error(errors[0].message);
      result = data;
    }

    if (!result) {
      throw new Error('Failed to save categories');
    }

    const parsedCategories = typeof result.categories === 'string'
      ? JSON.parse(result.categories)
      : (result.categories ?? []);
    return {
      version: 1 as const,
      userId: user.id,
      categories: parsedCategories as Category[],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  /**
   * Check if Google account is connected and get settings.
   */
  async getGoogleConnection(): Promise<{
    connected: boolean;
    email: string | null;
    defaultCalendarCategory: string | null;
    defaultTaskCategory: string | null;
  }> {
    // Model may not exist yet if sandbox hasn't been redeployed
    if (!client.models.UserGoogleTokens) {
      return { connected: false, email: null, defaultCalendarCategory: null, defaultTaskCategory: null };
    }

    const { data, errors } = await client.models.UserGoogleTokens.list();
    if (errors?.length) throw new Error(errors[0].message);

    const record = data[0];
    if (!record) {
      return { connected: false, email: null, defaultCalendarCategory: null, defaultTaskCategory: null };
    }

    return {
      connected: true,
      email: record.email ?? null,
      defaultCalendarCategory: record.defaultCalendarCategory ?? null,
      defaultTaskCategory: record.defaultTaskCategory ?? null,
    };
  },

  /**
   * Update Google integration category settings.
   */
  async updateGoogleSettings(settings: {
    defaultCalendarCategory?: string | null;
    defaultTaskCategory?: string | null;
  }): Promise<void> {
    if (!client.models.UserGoogleTokens) throw new Error('Google integration not available');

    const { data } = await client.models.UserGoogleTokens.list();
    const record = data[0];
    if (!record) throw new Error('Google account not connected');

    await client.models.UserGoogleTokens.update({
      id: record.id,
      ...settings,
    });
  },

  /**
   * Exchange Google OAuth authorization code for tokens.
   */
  async googleAuthExchange(
    code: string,
    redirectUri: string
  ): Promise<{ success: boolean; email: string | null; error: string | null }> {
    const { data, errors } = await client.mutations.googleAuthExchange({
      code,
      redirectUri,
    });
    if (errors?.length) throw new Error(errors[0].message);
    return {
      success: data?.success ?? false,
      email: data?.email ?? null,
      error: data?.error ?? null,
    };
  },

  /**
   * Sync Google Calendar events and Tasks for a date.
   */
  async googleSync(
    date: string
  ): Promise<{
    success: boolean;
    events: GoogleCalendarEvent[];
    tasks: GoogleTaskItem[];
    error: string | null;
  }> {
    const { data, errors } = await client.queries.googleSync({ date });
    if (errors?.length) throw new Error(errors[0].message);
    return {
      success: data?.success ?? false,
      events: (data?.events ?? []) as GoogleCalendarEvent[],
      tasks: (data?.tasks ?? []) as GoogleTaskItem[],
      error: data?.error ?? null,
    };
  },

  /**
   * Disconnect Google account.
   */
  async googleDisconnect(): Promise<{ success: boolean; error: string | null }> {
    const { data, errors } = await client.mutations.googleDisconnect();
    if (errors?.length) throw new Error(errors[0].message);
    return {
      success: data?.success ?? false,
      error: data?.error ?? null,
    };
  },

  /**
   * Subscribe to DayState updates for a specific date.
   * Used for real-time sync across tabs/devices.
   */
  subscribeToDayStateUpdates(
    date: string,
    onUpdate: (state: DayState) => void,
    onError?: (error: Error) => void
  ): DayStateSubscription {
    const subscription = client.models.DayState.onUpdate({
      filter: { date: { eq: date } },
    }).subscribe({
      next: async (data) => {
        try {
          const user = await authService.getCurrentUser();
          if (!user) return;

          const blocks = typeof data.blocks === 'string'
            ? JSON.parse(data.blocks)
            : (data.blocks ?? []);

          const dayState: DayState = {
            version: 1 as const,
            date: data.date,
            userId: user.id,
            dayStartAt: data.dayStartAt ?? null,
            blocks: blocks as Block[],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          onUpdate(dayState);
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error('Subscription parse error'));
        }
      },
      error: (error) => {
        onError?.(error instanceof Error ? error : new Error('Subscription error'));
      },
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};

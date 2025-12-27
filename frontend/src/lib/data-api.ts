import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import type { DayState, Block } from '@day-timeline/shared';
import { authService } from './auth-service';

const client = generateClient<Schema>();

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

    // Create default state if none exists
    const { createDefaultDayState } = await import('@day-timeline/shared');
    const defaultState = createDefaultDayState(user.id, date);
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
};

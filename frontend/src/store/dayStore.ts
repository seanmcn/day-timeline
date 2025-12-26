import { create } from 'zustand';
import type { DayState, DayMetrics } from '@day-timeline/shared';

interface DayStore {
  dayState: DayState | null;
  metrics: DayMetrics | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadDay: (date: string) => Promise<void>;
}

// Placeholder store - will be implemented in Phase 6
export const useDayStore = create<DayStore>(() => ({
  dayState: null,
  metrics: null,
  isLoading: false,
  isSaving: false,
  error: null,
  loadDay: async () => {},
}));

import { create } from 'zustand';
import {
  type DayState,
  type Block,
  type TimeSession,
  type DayMetrics,
  generateId,
  calculateDayMetrics,
} from '@day-timeline/shared';
import { api } from '@/lib/api';

interface DayStore {
  dayState: DayState | null;
  metrics: DayMetrics | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadDay: (date: string) => Promise<void>;
  saveDay: () => Promise<void>;

  // Day actions
  startDay: (time?: string) => void;
  updateDayStart: (time: string) => void;

  // Block actions
  reorderBlocks: (activeId: string, overId: string) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  duplicateBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;

  // Time tracking
  startSession: (blockId: string) => void;
  stopSession: (blockId: string) => void;
  stopAllSessions: () => void;

  // Internal
  recalculateMetrics: () => void;
}

export const useDayStore = create<DayStore>((set, get) => ({
  dayState: null,
  metrics: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadDay: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const state = await api.getState(date);
      const metrics = calculateDayMetrics(state);
      set({ dayState: state, metrics, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load day',
        isLoading: false,
      });
    }
  },

  saveDay: async () => {
    const { dayState } = get();
    if (!dayState) return;

    set({ isSaving: true });
    try {
      await api.putState(dayState.date, dayState);
      set({ isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  startDay: (time?: string) => {
    set((state) => {
      if (!state.dayState) return state;
      const dayStartAt = time || new Date().toISOString();
      const newState = {
        ...state.dayState,
        dayStartAt,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  updateDayStart: (time: string) => {
    set((state) => {
      if (!state.dayState) return state;
      const newState = {
        ...state.dayState,
        dayStartAt: time,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  reorderBlocks: (activeId: string, overId: string) => {
    set((state) => {
      if (!state.dayState) return state;

      const blocks = [...state.dayState.blocks];
      const activeIndex = blocks.findIndex((b) => b.id === activeId);
      const overIndex = blocks.findIndex((b) => b.id === overId);

      if (activeIndex === -1 || overIndex === -1) return state;

      const [removed] = blocks.splice(activeIndex, 1);
      blocks.splice(overIndex, 0, removed);

      // Update order property
      blocks.forEach((block, index) => {
        block.order = index;
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  updateBlock: (blockId: string, updates: Partial<Block>) => {
    set((state) => {
      if (!state.dayState) return state;

      const blocks = state.dayState.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      );

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  duplicateBlock: (blockId: string) => {
    set((state) => {
      if (!state.dayState) return state;

      const blockIndex = state.dayState.blocks.findIndex(
        (b) => b.id === blockId
      );
      if (blockIndex === -1) return state;

      const original = state.dayState.blocks[blockIndex];
      const duplicate: Block = {
        ...original,
        id: generateId(),
        sessions: [],
        order: original.order + 0.5,
      };

      const blocks = [...state.dayState.blocks];
      blocks.splice(blockIndex + 1, 0, duplicate);

      // Normalize order
      blocks.forEach((block, index) => {
        block.order = index;
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  deleteBlock: (blockId: string) => {
    set((state) => {
      if (!state.dayState) return state;

      const blocks = state.dayState.blocks.filter((b) => b.id !== blockId);

      // Normalize order
      blocks.forEach((block, index) => {
        block.order = index;
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  startSession: (blockId: string) => {
    // First stop any active sessions
    get().stopAllSessions();

    set((state) => {
      if (!state.dayState) return state;

      const blocks = state.dayState.blocks.map((block) => {
        if (block.id !== blockId) return block;

        const newSession: TimeSession = {
          id: generateId(),
          startedAt: new Date().toISOString(),
          endedAt: null,
        };

        return {
          ...block,
          sessions: [...block.sessions, newSession],
        };
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  stopSession: (blockId: string) => {
    set((state) => {
      if (!state.dayState) return state;

      const blocks = state.dayState.blocks.map((block) => {
        if (block.id !== blockId) return block;

        const sessions = block.sessions.map((session) => {
          if (session.endedAt !== null) return session;
          return { ...session, endedAt: new Date().toISOString() };
        });

        return { ...block, sessions };
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
    get().saveDay();
  },

  stopAllSessions: () => {
    set((state) => {
      if (!state.dayState) return state;

      const hasActiveSessions = state.dayState.blocks.some((block) =>
        block.sessions.some((s) => s.endedAt === null)
      );

      if (!hasActiveSessions) return state;

      const blocks = state.dayState.blocks.map((block) => {
        const sessions = block.sessions.map((session) => {
          if (session.endedAt !== null) return session;
          return { ...session, endedAt: new Date().toISOString() };
        });
        return { ...block, sessions };
      });

      const newState = {
        ...state.dayState,
        blocks,
        updatedAt: new Date().toISOString(),
      };
      const metrics = calculateDayMetrics(newState);
      return { dayState: newState, metrics };
    });
  },

  recalculateMetrics: () => {
    set((state) => {
      if (!state.dayState) return state;
      const metrics = calculateDayMetrics(state.dayState);
      return { metrics };
    });
  },
}));

// Set up interval to recalculate metrics (for active sessions)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useDayStore.getState();
    if (store.metrics?.currentBlockId) {
      store.recalculateMetrics();
    }
  }, 1000);
}

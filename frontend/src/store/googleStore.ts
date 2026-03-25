import { create } from 'zustand';
import { dataApi } from '@/lib/data-api';

interface GoogleStore {
  isConnected: boolean;
  googleEmail: string | null;
  defaultCalendarCategory: string | null;
  defaultTaskCategory: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  loadConnectionStatus: () => Promise<void>;
  exchangeCode: (code: string, redirectUri: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  updateSettings: (settings: {
    defaultCalendarCategory?: string | null;
    defaultTaskCategory?: string | null;
  }) => Promise<void>;
  syncForDate: (date: string) => ReturnType<typeof dataApi.googleSync>;
}

export const useGoogleStore = create<GoogleStore>((set) => ({
  isConnected: false,
  googleEmail: null,
  defaultCalendarCategory: null,
  defaultTaskCategory: null,
  isLoading: false,
  isSyncing: false,
  error: null,

  loadConnectionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const connection = await dataApi.getGoogleConnection();
      set({
        isConnected: connection.connected,
        googleEmail: connection.email,
        defaultCalendarCategory: connection.defaultCalendarCategory,
        defaultTaskCategory: connection.defaultTaskCategory,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  exchangeCode: async (code: string, redirectUri: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await dataApi.googleAuthExchange(code, redirectUri);
      if (result.success) {
        set({
          isConnected: true,
          googleEmail: result.email,
          isLoading: false,
        });
        return true;
      }
      set({ isLoading: false, error: result.error ?? 'Auth failed' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  disconnect: async () => {
    set({ isLoading: true, error: null });
    try {
      await dataApi.googleDisconnect();
      set({
        isConnected: false,
        googleEmail: null,
        defaultCalendarCategory: null,
        defaultTaskCategory: null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  updateSettings: async (settings) => {
    try {
      await dataApi.updateGoogleSettings(settings);
      set((state) => ({
        ...state,
        ...settings,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  syncForDate: async (date: string) => {
    set({ isSyncing: true, error: null });
    try {
      const result = await dataApi.googleSync(date);
      set({ isSyncing: false });
      if (!result.success) {
        set({ error: result.error ?? 'Sync failed' });
      }
      return result;
    } catch (err: any) {
      set({ isSyncing: false, error: err.message });
      return { success: false, events: [], tasks: [], error: err.message };
    }
  },
}));

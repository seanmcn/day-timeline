import { create } from 'zustand';
import { authService, type AuthUser } from '@/lib/auth-service';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signIn(email, password);
      set({ user, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ user: null, isLoading: false });
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user on error
      set({ user: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false });
    } catch (err) {
      console.error('Auth check error:', err);
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

import { create } from 'zustand';
import { type Category, generateId } from '@day-timeline/shared';
import { dataApi } from '@/lib/data-api';

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  saveCategories: () => Promise<void>;

  // Category CRUD
  addCategory: (name: string, color: string, icon?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  restoreCategory: (id: string) => void;
  reorderCategories: (activeId: string, overId: string) => void;

  // Utility
  getActiveCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryColor: (id: string) => string;
}

// Fallback color for unknown categories
const DEFAULT_COLOR = '210 15% 50%';

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCategories = await dataApi.getCategories();
      set({ categories: userCategories.categories, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load categories',
        isLoading: false,
      });
    }
  },

  saveCategories: async () => {
    const { categories } = get();
    set({ isSaving: true });
    try {
      await dataApi.putCategories({
        version: 1,
        userId: '', // Will be set by API
        categories,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      set({ isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save categories',
        isSaving: false,
      });
    }
  },

  addCategory: (name, color, icon) => {
    set((state) => {
      const newCategory: Category = {
        id: generateId(),
        name,
        color,
        icon,
        isDeleted: false,
        order: state.categories.length,
      };
      return { categories: [...state.categories, newCategory] };
    });
    get().saveCategories();
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().saveCategories();
  },

  deleteCategory: (id) => {
    // Soft delete - mark as deleted but keep for historical data
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, isDeleted: true } : c
      ),
    }));
    get().saveCategories();
  },

  restoreCategory: (id) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, isDeleted: false } : c
      ),
    }));
    get().saveCategories();
  },

  reorderCategories: (activeId, overId) => {
    set((state) => {
      const categories = [...state.categories];
      const activeIndex = categories.findIndex((c) => c.id === activeId);
      const overIndex = categories.findIndex((c) => c.id === overId);

      if (activeIndex === -1 || overIndex === -1) return state;

      const [removed] = categories.splice(activeIndex, 1);
      categories.splice(overIndex, 0, removed);

      // Normalize order
      categories.forEach((c, i) => {
        c.order = i;
      });

      return { categories };
    });
    get().saveCategories();
  },

  getActiveCategories: () => {
    const { categories } = get();
    return categories
      .filter((c) => !c.isDeleted)
      .sort((a, b) => a.order - b.order);
  },

  getCategoryById: (id) => {
    const { categories } = get();
    return categories.find((c) => c.id === id);
  },

  getCategoryColor: (id) => {
    const category = get().getCategoryById(id);
    return category?.color ?? DEFAULT_COLOR;
  },
}));

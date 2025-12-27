import { create } from 'zustand';
import {
  type BlockTemplate,
  type TaskTemplate,
  generateId,
  calculateBlockEstimateFromTasks,
} from '@day-timeline/shared';
import { dataApi } from '@/lib/data-api';

interface TemplateStore {
  templates: BlockTemplate[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadTemplates: () => Promise<void>;
  saveTemplates: () => Promise<void>;

  // Template CRUD
  addTemplate: (template: Omit<BlockTemplate, 'id' | 'order'>) => void;
  updateTemplate: (id: string, updates: Partial<BlockTemplate>) => void;
  deleteTemplate: (id: string) => void;
  reorderTemplates: (activeId: string, overId: string) => void;

  // Task management within templates
  addTaskToTemplate: (templateId: string, task: Omit<TaskTemplate, 'id' | 'order'>) => void;
  updateTaskInTemplate: (templateId: string, taskId: string, updates: Partial<TaskTemplate>) => void;
  removeTaskFromTemplate: (templateId: string, taskId: string) => void;
  reorderTasksInTemplate: (templateId: string, activeId: string, overId: string) => void;

  // Utility
  sumTasksToEstimate: (templateId: string) => void;
  getActiveTemplates: () => BlockTemplate[];
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const userTemplates = await dataApi.getTemplates();
      set({ templates: userTemplates.templates, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load templates',
        isLoading: false,
      });
    }
  },

  saveTemplates: async () => {
    const { templates } = get();
    set({ isSaving: true });
    try {
      await dataApi.putTemplates({
        version: 1,
        userId: '', // Will be set by API
        templates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      set({ isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save templates',
        isSaving: false,
      });
    }
  },

  addTemplate: (template) => {
    set((state) => {
      const newTemplate: BlockTemplate = {
        ...template,
        id: generateId(),
        order: state.templates.length,
      };
      return { templates: [...state.templates, newTemplate] };
    });
    get().saveTemplates();
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
    get().saveTemplates();
  },

  deleteTemplate: (id) => {
    set((state) => {
      const templates = state.templates.filter((t) => t.id !== id);
      // Normalize order
      templates.forEach((t, i) => {
        t.order = i;
      });
      return { templates };
    });
    get().saveTemplates();
  },

  reorderTemplates: (activeId, overId) => {
    set((state) => {
      const templates = [...state.templates];
      const activeIndex = templates.findIndex((t) => t.id === activeId);
      const overIndex = templates.findIndex((t) => t.id === overId);

      if (activeIndex === -1 || overIndex === -1) return state;

      const [removed] = templates.splice(activeIndex, 1);
      templates.splice(overIndex, 0, removed);

      // Normalize order
      templates.forEach((t, i) => {
        t.order = i;
      });

      return { templates };
    });
    get().saveTemplates();
  },

  addTaskToTemplate: (templateId, task) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        const newTask: TaskTemplate = {
          ...task,
          id: generateId(),
          order: t.tasks.length,
        };
        return { ...t, tasks: [...t.tasks, newTask] };
      }),
    }));
    get().saveTemplates();
  },

  updateTaskInTemplate: (templateId, taskId, updates) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        return {
          ...t,
          tasks: t.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        };
      }),
    }));
    get().saveTemplates();
  },

  removeTaskFromTemplate: (templateId, taskId) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        const tasks = t.tasks.filter((task) => task.id !== taskId);
        // Normalize order
        tasks.forEach((task, i) => {
          task.order = i;
        });
        return { ...t, tasks };
      }),
    }));
    get().saveTemplates();
  },

  reorderTasksInTemplate: (templateId, activeId, overId) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;

        const tasks = [...t.tasks];
        const activeIndex = tasks.findIndex((task) => task.id === activeId);
        const overIndex = tasks.findIndex((task) => task.id === overId);

        if (activeIndex === -1 || overIndex === -1) return t;

        const [removed] = tasks.splice(activeIndex, 1);
        tasks.splice(overIndex, 0, removed);

        // Normalize order
        tasks.forEach((task, i) => {
          task.order = i;
        });

        return { ...t, tasks };
      }),
    }));
    get().saveTemplates();
  },

  sumTasksToEstimate: (templateId) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        const sum = calculateBlockEstimateFromTasks(t.tasks);
        return { ...t, defaultMinutes: sum, useTaskEstimates: true };
      }),
    }));
    get().saveTemplates();
  },

  getActiveTemplates: () => {
    const { templates } = get();
    return templates
      .filter((t) => !t.isHidden)
      .sort((a, b) => a.order - b.order);
  },
}));

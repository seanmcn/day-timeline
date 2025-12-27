// Block category - now dynamic, stored as string ID reference
export type BlockCategory = string;

// User-defined category
export interface Category {
  id: string;
  name: string;
  color: string; // HSL value like "174 72% 56%"
  icon?: string; // Lucide icon name like "briefcase"
  isDeleted: boolean;
  order: number;
}

// Default categories for new users
export const DEFAULT_CATEGORIES: Omit<Category, 'order'>[] = [
  { id: 'work', name: 'Work', color: '210 80% 50%', icon: 'briefcase', isDeleted: false },
  { id: 'routine', name: 'Routine', color: '38 92% 50%', icon: 'coffee', isDeleted: false },
  { id: 'leisure', name: 'Leisure', color: '270 60% 50%', icon: 'gamepad-2', isDeleted: false },
];

// Icon options for category picker (Lucide icon names)
export const CATEGORY_ICONS = [
  'briefcase',
  'coffee',
  'gamepad-2',
  'book',
  'dumbbell',
  'heart',
  'music',
  'code',
  'palette',
  'utensils',
  'bed',
  'sun',
  'moon',
  'car',
  'plane',
  'home',
  'users',
  'phone',
  'mail',
  'calendar',
  'clock',
  'target',
  'zap',
  'star',
];

// Color palette for category picker
export const CATEGORY_COLORS = [
  { name: 'Blue', value: '210 80% 50%' },
  { name: 'Cyan', value: '174 72% 56%' },
  { name: 'Teal', value: '174 72% 40%' },
  { name: 'Green', value: '142 76% 36%' },
  { name: 'Orange', value: '38 92% 50%' },
  { name: 'Red', value: '0 72% 51%' },
  { name: 'Pink', value: '330 70% 50%' },
  { name: 'Purple', value: '270 60% 50%' },
];

// Collection of user's categories stored in DB
export interface UserCategories {
  version: 1;
  userId: string;
  categories: Category[];
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

// Initialize user categories with defaults
export function createDefaultUserCategories(userId: string): UserCategories {
  const now = new Date().toISOString();
  return {
    version: 1,
    userId,
    categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, order: i })),
    createdAt: now,
    updatedAt: now,
  };
}

// Task within a template (no completion state)
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimateMinutes?: number;
  order: number;
}

// Task within a daily block (has completion state)
export interface Task {
  id: string;
  templateId?: string; // Reference to original template task
  name: string;
  description?: string;
  estimateMinutes?: number;
  completed: boolean;
  order: number;
}

// User's reusable block template
export interface BlockTemplate {
  id: string;
  name: string;
  defaultMinutes: number;
  category: BlockCategory;
  tasks: TaskTemplate[];
  useTaskEstimates: boolean; // If true, estimate = sum of task estimates
  order: number;
  isDefault: boolean; // System default (can be hidden but not deleted)
  isHidden: boolean; // User can hide templates they don't use
}

// Collection of user's block templates stored in DB
export interface UserTemplates {
  version: 1;
  userId: string;
  templates: BlockTemplate[];
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

// Default templates for new users
export const DEFAULT_TEMPLATES: Omit<BlockTemplate, 'order'>[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    defaultMinutes: 90,
    category: 'routine',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'deep-work-1',
    name: 'Deep Work',
    defaultMinutes: 150,
    category: 'work',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'lunch',
    name: 'Lunch',
    defaultMinutes: 60,
    category: 'routine',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'deep-work-2',
    name: 'Deep Work',
    defaultMinutes: 150,
    category: 'work',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    defaultMinutes: 60,
    category: 'routine',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'light-work',
    name: 'Light Work',
    defaultMinutes: 90,
    category: 'work',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
  {
    id: 'wind-down',
    name: 'Wind Down',
    defaultMinutes: 120,
    category: 'routine',
    tasks: [],
    useTaskEstimates: false,
    isDefault: true,
    isHidden: false,
  },
];

// Time tracking session
export interface TimeSession {
  id: string;
  startedAt: string; // ISO 8601 UTC
  endedAt: string | null; // ISO 8601 UTC, null if in progress
}

// Individual block in the day
export interface Block {
  id: string;
  templateId?: string; // Reference to BlockTemplate.id
  label: string;
  estimateMinutes: number;
  category: BlockCategory;
  sessions: TimeSession[];
  tasks: Task[];
  notes: string;
  order: number;
  completed: boolean;
  actualMinutesOverride?: number;
  useTaskEstimates: boolean; // If true, estimate = sum of task estimates
}

// Day state stored in DynamoDB via Amplify Data
export interface DayState {
  version: 1;
  date: string; // YYYY-MM-DD
  userId: string; // Populated from auth context
  dayStartAt: string | null; // ISO 8601 UTC, null if day not started
  blocks: Block[];
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

// Category breakdown with planned vs actual
export interface CategoryMetrics {
  planned: number;
  actual: number;
}

// Computed metrics (calculated on frontend)
export interface DayMetrics {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  totalDeltaMinutes: number; // actual - planned
  // Legacy fields (actual minutes only) - kept for compatibility
  workMinutes: number;
  movementMinutes: number;
  leisureMinutes: number;
  routineMinutes: number;
  // Category breakdowns with planned vs actual (dynamic keys)
  categories: Record<string, CategoryMetrics>;
  plannedBedtime: string | null; // ISO 8601 UTC
  forecastBedtime: string | null; // ISO 8601 UTC
  currentBlockId: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Calculate block estimate from its tasks
export function calculateBlockEstimateFromTasks(tasks: Task[] | TaskTemplate[]): number {
  return tasks.reduce((sum, task) => sum + (task.estimateMinutes || 0), 0);
}

// Get effective estimate for a block (respects useTaskEstimates flag)
export function getBlockEffectiveEstimate(block: Block): number {
  if (block.useTaskEstimates && block.tasks.length > 0) {
    return calculateBlockEstimateFromTasks(block.tasks);
  }
  return block.estimateMinutes;
}

// Create a block from a template
export function createBlockFromTemplate(template: BlockTemplate, order: number): Block {
  return {
    id: generateId(),
    templateId: template.id,
    label: template.name,
    estimateMinutes: template.useTaskEstimates
      ? calculateBlockEstimateFromTasks(template.tasks)
      : template.defaultMinutes,
    category: template.category,
    sessions: [],
    tasks: template.tasks.map((t, i) => ({
      id: generateId(),
      templateId: t.id,
      name: t.name,
      description: t.description,
      estimateMinutes: t.estimateMinutes,
      completed: false,
      order: i,
    })),
    notes: '',
    order,
    completed: false,
    useTaskEstimates: template.useTaskEstimates,
  };
}

// Initialize user templates with defaults
export function createDefaultUserTemplates(userId: string): UserTemplates {
  const now = new Date().toISOString();
  return {
    version: 1,
    userId,
    templates: DEFAULT_TEMPLATES.map((t, i) => ({ ...t, order: i })),
    createdAt: now,
    updatedAt: now,
  };
}

// Create default day state from templates
export function createDefaultDayState(
  userId: string,
  date: string,
  templates?: BlockTemplate[]
): DayState {
  const now = new Date().toISOString();

  // Use provided templates or fall back to defaults
  const activeTemplates = templates
    ? templates.filter((t) => !t.isHidden).sort((a, b) => a.order - b.order)
    : DEFAULT_TEMPLATES.map((t, i) => ({ ...t, order: i }));

  const blocks: Block[] = activeTemplates.map((template, index) =>
    createBlockFromTemplate(template as BlockTemplate, index)
  );

  return {
    version: 1,
    date,
    userId,
    dayStartAt: null,
    blocks,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateBlockActualMinutes(block: Block): number {
  if (block.actualMinutesOverride !== undefined) {
    return block.actualMinutesOverride;
  }
  return block.sessions.reduce((total, session) => {
    if (!session.endedAt) {
      // Session in progress - calculate up to now
      const start = new Date(session.startedAt).getTime();
      const now = Date.now();
      return total + (now - start) / 60000;
    }
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.endedAt).getTime();
    return total + (end - start) / 60000;
  }, 0);
}

export function calculateDayMetrics(state: DayState): DayMetrics {
  let totalPlannedMinutes = 0;
  let totalActualMinutes = 0;
  let currentBlockId: string | null = null;

  // Dynamic category tracking with planned and actual
  const categories: Record<string, CategoryMetrics> = {};

  for (const block of state.blocks) {
    // Use effective estimate (respects useTaskEstimates)
    const plannedMinutes = getBlockEffectiveEstimate(block);
    totalPlannedMinutes += plannedMinutes;
    const actualMinutes = calculateBlockActualMinutes(block);
    totalActualMinutes += actualMinutes;

    // Track both planned and actual per category (dynamic)
    if (!categories[block.category]) {
      categories[block.category] = { planned: 0, actual: 0 };
    }
    categories[block.category].planned += plannedMinutes;
    categories[block.category].actual += actualMinutes;

    // Check for active session
    const hasActiveSession = block.sessions.some((s) => s.endedAt === null);
    if (hasActiveSession) {
      currentBlockId = block.id;
    }
  }

  // Calculate planned bedtime (dayStart + totalPlanned)
  let plannedBedtime: string | null = null;
  if (state.dayStartAt) {
    const startTime = new Date(state.dayStartAt).getTime();
    const bedtimeMs = startTime + totalPlannedMinutes * 60000;
    plannedBedtime = new Date(bedtimeMs).toISOString();
  }

  // Calculate forecast bedtime (now + remainingPlanned)
  let forecastBedtime: string | null = null;
  if (state.dayStartAt) {
    const remainingMinutes = totalPlannedMinutes - totalActualMinutes;
    const forecastMs = Date.now() + remainingMinutes * 60000;
    forecastBedtime = new Date(forecastMs).toISOString();
  }

  return {
    totalPlannedMinutes,
    totalActualMinutes,
    totalDeltaMinutes: totalActualMinutes - totalPlannedMinutes,
    // Legacy fields for compatibility
    workMinutes: categories.work?.actual ?? 0,
    movementMinutes: categories.movement?.actual ?? 0,
    leisureMinutes: categories.leisure?.actual ?? 0,
    routineMinutes: categories.routine?.actual ?? 0,
    // Dynamic category breakdowns
    categories,
    plannedBedtime,
    forecastBedtime,
    currentBlockId,
  };
}

// Date utilities
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

// Block category for organizing and color-coding
export type BlockCategory = 'work' | 'movement' | 'routine' | 'leisure';

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

// Computed metrics (calculated on frontend)
export interface DayMetrics {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  totalDeltaMinutes: number; // actual - planned
  workMinutes: number;
  movementMinutes: number;
  leisureMinutes: number;
  routineMinutes: number;
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
  let workMinutes = 0;
  let movementMinutes = 0;
  let leisureMinutes = 0;
  let routineMinutes = 0;
  let currentBlockId: string | null = null;

  for (const block of state.blocks) {
    // Use effective estimate (respects useTaskEstimates)
    totalPlannedMinutes += getBlockEffectiveEstimate(block);
    const actualMinutes = calculateBlockActualMinutes(block);
    totalActualMinutes += actualMinutes;

    // Use category stored directly on block
    switch (block.category) {
      case 'work':
        workMinutes += actualMinutes;
        break;
      case 'movement':
        movementMinutes += actualMinutes;
        break;
      case 'leisure':
        leisureMinutes += actualMinutes;
        break;
      case 'routine':
        routineMinutes += actualMinutes;
        break;
    }

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
    workMinutes,
    movementMinutes,
    leisureMinutes,
    routineMinutes,
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

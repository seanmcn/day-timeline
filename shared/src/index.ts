// Block Types (hardcoded for MVP)
export const BLOCK_TYPES = {
  WAKE_WARMUP: 'wake-warmup',
  DEEP_WORK: 'deep-work',
  BREAK_MOVEMENT: 'break-movement',
  FOOD_ADMIN: 'food-admin',
  DOTA: 'dota',
  LIGHT_WORK: 'light-work',
  WIND_DOWN: 'wind-down',
  BED_COMICS: 'bed-comics',
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

export type BlockCategory = 'work' | 'movement' | 'routine' | 'leisure';

// Default block configurations
export const DEFAULT_BLOCKS: Record<
  BlockType,
  { label: string; defaultMinutes: number; category: BlockCategory }
> = {
  [BLOCK_TYPES.WAKE_WARMUP]: {
    label: 'Wake + Warm-up',
    defaultMinutes: 90,
    category: 'routine',
  },
  [BLOCK_TYPES.DEEP_WORK]: {
    label: 'Deep Work',
    defaultMinutes: 150,
    category: 'work',
  },
  [BLOCK_TYPES.BREAK_MOVEMENT]: {
    label: 'Break + Movement',
    defaultMinutes: 30,
    category: 'movement',
  },
  [BLOCK_TYPES.FOOD_ADMIN]: {
    label: 'Food + Admin',
    defaultMinutes: 90,
    category: 'routine',
  },
  [BLOCK_TYPES.DOTA]: {
    label: 'Dota',
    defaultMinutes: 90,
    category: 'leisure',
  },
  [BLOCK_TYPES.LIGHT_WORK]: {
    label: 'Light Work',
    defaultMinutes: 90,
    category: 'work',
  },
  [BLOCK_TYPES.WIND_DOWN]: {
    label: 'Wind-down',
    defaultMinutes: 120,
    category: 'routine',
  },
  [BLOCK_TYPES.BED_COMICS]: {
    label: 'Bed (Comics)',
    defaultMinutes: 120,
    category: 'routine',
  },
};

// Time tracking session
export interface TimeSession {
  id: string;
  startedAt: string; // ISO 8601 UTC
  endedAt: string | null; // ISO 8601 UTC, null if in progress
}

// Individual block in the day
export interface Block {
  id: string;
  type: BlockType;
  label: string; // Can be customized from default
  estimateMinutes: number;
  sessions: TimeSession[];
  notes: string;
  order: number;
}

// Day state stored in S3
export interface DayState {
  version: 1;
  date: string; // YYYY-MM-DD
  userId: string;
  dayStartAt: string | null; // ISO 8601 UTC, null if day not started
  blocks: Block[];
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

// User's default template
export interface DayTemplate {
  version: 1;
  userId: string;
  blocks: Omit<Block, 'sessions'>[];
  updatedAt: string;
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

export function createDefaultDayState(userId: string, date: string): DayState {
  const now = new Date().toISOString();
  const blockTypes = Object.keys(DEFAULT_BLOCKS) as BlockType[];

  const defaultBlocks: Block[] = blockTypes.map((type, index) => ({
    id: generateId(),
    type,
    label: DEFAULT_BLOCKS[type].label,
    estimateMinutes: DEFAULT_BLOCKS[type].defaultMinutes,
    sessions: [],
    notes: '',
    order: index,
  }));

  return {
    version: 1,
    date,
    userId,
    dayStartAt: null,
    blocks: defaultBlocks,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateBlockActualMinutes(block: Block): number {
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
    totalPlannedMinutes += block.estimateMinutes;
    const actualMinutes = calculateBlockActualMinutes(block);
    totalActualMinutes += actualMinutes;

    const category = DEFAULT_BLOCKS[block.type]?.category || 'routine';
    switch (category) {
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

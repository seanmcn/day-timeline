import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type Block,
  calculateBlockActualMinutes,
  DEFAULT_BLOCKS,
} from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { formatDuration, formatDelta, formatTime } from '@/lib/time';

interface BlockItemProps {
  block: Block;
  index: number;
  dayStartAt: string | null;
  previousBlocks: Block[];
}

export function BlockItem({
  block,
  index,
  dayStartAt,
  previousBlocks,
}: BlockItemProps) {
  const { updateBlock, duplicateBlock, deleteBlock, startSession, stopSession, metrics } =
    useDayStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const actualMinutes = calculateBlockActualMinutes(block);
  const deltaMinutes = actualMinutes - block.estimateMinutes;
  const isActive = metrics?.currentBlockId === block.id;
  const hasActiveSession = block.sessions.some((s) => s.endedAt === null);

  // Calculate planned start time
  let plannedStartTime: string | null = null;
  if (dayStartAt) {
    const previousMinutes = previousBlocks.reduce(
      (sum, b) => sum + b.estimateMinutes,
      0
    );
    const startTime = new Date(dayStartAt);
    startTime.setMinutes(startTime.getMinutes() + previousMinutes);
    plannedStartTime = startTime.toISOString();
  }

  const category = DEFAULT_BLOCKS[block.type]?.category || 'routine';
  const categoryColors: Record<string, string> = {
    work: 'border-l-blue-500',
    movement: 'border-l-green-500',
    leisure: 'border-l-purple-500',
    routine: 'border-l-gray-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]
                  ${categoryColors[category]} border-l-4
                  ${isActive ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
    >
      <div className="p-4">
        {/* Header row with drag handle and title */}
        <div className="flex items-center gap-3 mb-3">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-2 -m-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="6" y="4" width="2" height="2" rx="1" />
              <rect x="12" y="4" width="2" height="2" rx="1" />
              <rect x="6" y="9" width="2" height="2" rx="1" />
              <rect x="12" y="9" width="2" height="2" rx="1" />
              <rect x="6" y="14" width="2" height="2" rx="1" />
              <rect x="12" y="14" width="2" height="2" rx="1" />
            </svg>
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={block.label}
              onChange={(e) => updateBlock(block.id, { label: e.target.value })}
              className="bg-transparent font-semibold text-lg w-full focus:outline-none
                         focus:border-b focus:border-[var(--color-accent)]"
            />
            {plannedStartTime && (
              <div className="text-xs text-[var(--color-text-muted)]">
                Planned: {formatTime(plannedStartTime)}
              </div>
            )}
          </div>
        </div>

        {/* Time tracking row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[var(--color-text-muted)]">Est: </span>
              <input
                type="number"
                value={block.estimateMinutes}
                onChange={(e) =>
                  updateBlock(block.id, {
                    estimateMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 w-16 text-center"
                min="0"
                step="15"
              />
              <span className="ml-1">min</span>
            </div>

            {actualMinutes > 0 && (
              <div className="text-sm">
                <span className="text-[var(--color-text-muted)]">Actual: </span>
                <span>{formatDuration(actualMinutes)}</span>
                <span
                  className={`ml-2 ${
                    deltaMinutes > 0
                      ? 'text-[var(--color-warning)]'
                      : 'text-[var(--color-success)]'
                  }`}
                >
                  ({formatDelta(deltaMinutes)})
                </span>
              </div>
            )}
          </div>

          {/* Play/Stop button */}
          <button
            onClick={() =>
              hasActiveSession ? stopSession(block.id) : startSession(block.id)
            }
            className={`p-3 rounded-full transition-colors ${
              hasActiveSession
                ? 'bg-[var(--color-error)] hover:bg-[var(--color-error)]/90'
                : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90'
            }`}
            aria-label={hasActiveSession ? 'Stop tracking' : 'Start tracking'}
          >
            {hasActiveSession ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <rect x="4" y="4" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            )}
          </button>
        </div>

        {/* Actions row */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
          <button
            onClick={() => duplicateBlock(block.id)}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-1"
          >
            Duplicate
          </button>
          <button
            onClick={() => deleteBlock(block.id)}
            className="text-sm text-[var(--color-error)] hover:text-[var(--color-error)]/80 px-3 py-1"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

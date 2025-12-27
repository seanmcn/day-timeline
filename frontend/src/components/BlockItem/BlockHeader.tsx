import { useState, useMemo } from 'react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';
import { formatTime } from '@/lib/time';

interface BlockHeaderProps {
  block: Block;
  dayStartAt: string | null;
  previousBlocks: Block[];
  onTitleChange: (title: string) => void;
  dragHandleProps: {
    attributes: React.HTMLAttributes<HTMLButtonElement>;
    listeners: React.DOMAttributes<HTMLButtonElement> | undefined;
  };
}

export function BlockHeader({
  block,
  dayStartAt,
  previousBlocks,
  onTitleChange,
  dragHandleProps,
}: BlockHeaderProps) {
  const [showPlannedTooltip, setShowPlannedTooltip] = useState(false);

  const { plannedStartTime, projectedStartTime, isRunningBehind } = useMemo(() => {
    if (!dayStartAt) {
      return { plannedStartTime: null, projectedStartTime: null, isRunningBehind: false };
    }

    // Calculate planned start time based on dayStartAt + cumulative previous blocks
    const previousMinutes = previousBlocks.reduce((sum, b) => {
      if (b.completed) {
        return sum + calculateBlockActualMinutes(b);
      }
      return sum + b.estimateMinutes;
    }, 0);

    const planned = new Date(dayStartAt);
    planned.setMinutes(planned.getMinutes() + previousMinutes);

    // Calculate projected start time based on now + remaining incomplete previous blocks
    const remainingPreviousMinutes = previousBlocks
      .filter(b => !b.completed)
      .reduce((sum, b) => {
        const actual = calculateBlockActualMinutes(b);
        return sum + Math.max(0, b.estimateMinutes - actual);
      }, 0);

    const projected = new Date(Date.now() + remainingPreviousMinutes * 60000);

    const isBehind = Date.now() > planned.getTime();

    return {
      plannedStartTime: planned.toISOString(),
      projectedStartTime: projected.toISOString(),
      isRunningBehind: isBehind,
    };
  }, [dayStartAt, previousBlocks]);

  return (
    <div className="flex items-start gap-3 mb-3">
      {/* Drag handle */}
      <button
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
        className="touch-none p-2 -m-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-grab active:cursor-grabbing mt-1"
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={block.label}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`bg-transparent font-semibold text-lg w-full focus:outline-none
                       focus:border-b focus:border-[var(--color-accent)]
                       ${block.completed ? 'line-through text-[var(--color-text-muted)]' : ''}`}
          />
          {block.completed && (
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-[var(--color-success)] flex-shrink-0">
              <path fill="currentColor" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          )}
        </div>

        {/* Time display - smart switching */}
        {(plannedStartTime || projectedStartTime) && (
          <div className="relative inline-block">
            <button
              onClick={() => setShowPlannedTooltip(!showPlannedTooltip)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {isRunningBehind ? (
                <>Starts: {formatTime(projectedStartTime!)}</>
              ) : (
                <>Planned: {formatTime(plannedStartTime!)}</>
              )}
            </button>

            {/* Tooltip showing original planned time */}
            {showPlannedTooltip && isRunningBehind && plannedStartTime && (
              <div
                className="absolute left-0 top-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-xs z-20 whitespace-nowrap shadow-lg"
                onClick={() => setShowPlannedTooltip(false)}
              >
                Originally planned: {formatTime(plannedStartTime)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

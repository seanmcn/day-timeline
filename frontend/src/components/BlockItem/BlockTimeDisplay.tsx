import { useState, useEffect } from 'react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';
import { formatDuration, formatDelta, formatLiveTimer } from '@/lib/time';

interface BlockTimeDisplayProps {
  block: Block;
  hasActiveSession: boolean;
  isEditMode: boolean;
}

export function BlockTimeDisplay({
  block,
  hasActiveSession,
  isEditMode,
}: BlockTimeDisplayProps) {
  const [, forceUpdate] = useState({});

  // Force re-render every second when active session
  useEffect(() => {
    if (!hasActiveSession) return;

    const interval = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(interval);
  }, [hasActiveSession]);

  const actualMinutes = calculateBlockActualMinutes(block);
  const deltaMinutes = actualMinutes - block.estimateMinutes;

  // Don't show in edit mode - EditModeOverlay handles that
  if (isEditMode) return null;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Estimate display (read-only) */}
      <div className="text-sm">
        <span className="text-[var(--color-text-muted)]">Est: </span>
        <span className="font-medium">{block.estimateMinutes}m</span>
      </div>

      {/* Actual time display */}
      {(actualMinutes > 0 || block.completed) && (
        <div className="text-sm flex items-center gap-1">
          <span className="text-[var(--color-text-muted)]">Actual: </span>
          <span className={hasActiveSession ? 'font-mono text-[var(--color-accent)] font-medium text-base' : 'font-medium'}>
            {hasActiveSession ? formatLiveTimer(actualMinutes) : formatDuration(actualMinutes)}
          </span>
          {/* Delta - show when not actively timing or when completed */}
          {(!hasActiveSession || block.completed) && deltaMinutes !== 0 && (
            <span
              className={`ml-1 ${
                deltaMinutes > 0
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-success)]'
              }`}
            >
              ({formatDelta(deltaMinutes)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

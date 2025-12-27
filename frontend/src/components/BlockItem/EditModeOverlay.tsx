import { useState } from 'react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';

interface EditModeOverlayProps {
  block: Block;
  onSave: (updates: { estimateMinutes?: number; actualMinutesOverride?: number }) => void;
  onCancel: () => void;
}

export function EditModeOverlay({ block, onSave, onCancel }: EditModeOverlayProps) {
  const [estimate, setEstimate] = useState(block.estimateMinutes);
  const [actualOverride, setActualOverride] = useState(
    block.actualMinutesOverride ?? Math.round(calculateBlockActualMinutes(block))
  );

  const handleSave = () => {
    onSave({
      estimateMinutes: estimate,
      actualMinutesOverride: actualOverride,
    });
  };

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-accent)] rounded-lg p-3 mt-2">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Estimate
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={estimate}
              onChange={(e) => setEstimate(parseInt(e.target.value) || 0)}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-accent)] rounded px-2 py-1 w-20 text-center"
              min="0"
              step="15"
              autoFocus
            />
            <span className="text-sm text-[var(--color-text-muted)]">min</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Actual Override
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={actualOverride}
              onChange={(e) => setActualOverride(parseInt(e.target.value) || 0)}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-accent)] rounded px-2 py-1 w-20 text-center"
              min="0"
              step="15"
            />
            <span className="text-sm text-[var(--color-text-muted)]">min</span>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleSave}
            className="p-2 bg-[var(--color-success)] rounded-lg hover:bg-[var(--color-success)]/90 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Save"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onCancel}
            className="p-2 bg-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cancel"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

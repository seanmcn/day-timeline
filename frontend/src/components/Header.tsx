import { useDayStore } from '@/store/dayStore';
import { getTimeInputValue, setTimeFromInput } from '@/lib/time';

export function Header() {
  const { dayState, updateDayStart, isSaving } = useDayStore();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dayState?.dayStartAt) return;
    const newTime = setTimeFromInput(dayState.dayStartAt, e.target.value);
    updateDayStart(newTime);
  };

  return (
    <header className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold">Day Timeline</h1>

        <div className="flex items-center gap-4">
          {dayState?.dayStartAt && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">
                Started
              </span>
              <input
                type="time"
                value={getTimeInputValue(dayState.dayStartAt)}
                onChange={handleTimeChange}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-sm"
              />
            </div>
          )}

          {isSaving && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Saving...
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

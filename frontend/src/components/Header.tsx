import { Link } from 'react-router-dom';
import { useDayStore } from '@/store/dayStore';
import { useAuthStore } from '@/store/authStore';
import { getTimeInputValue, setTimeFromInput } from '@/lib/time';

export function Header() {
  const { dayState, updateDayStart, resetDay, isSaving } = useDayStore();
  const { user, logout } = useAuthStore();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dayState?.dayStartAt) return;
    const newTime = setTimeFromInput(dayState.dayStartAt, e.target.value);
    updateDayStart(newTime);
  };

  const handleReset = () => {
    if (confirm('Reset day? This will delete all progress and reload from your templates.')) {
      resetDay();
    }
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

          <button
            onClick={handleReset}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Reset day"
            title="Reset day from templates"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10a7 7 0 1 1 1.5 4.3" />
              <path d="M3 15V10h5" />
            </svg>
          </button>

          <Link
            to="/settings"
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10" cy="10" r="3" />
              <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" />
            </svg>
          </Link>

          <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-text-muted)]">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

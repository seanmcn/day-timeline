import { useDayStore } from '@/store/dayStore';

export function DayStartButton() {
  const { startDay } = useDayStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <p className="text-[var(--color-text-muted)] text-lg">
        Ready to start your day?
      </p>

      <button
        onClick={() => startDay()}
        className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90
                   text-white font-semibold text-xl px-12 py-6 rounded-2xl
                   transition-colors duration-200 active:scale-95
                   touch-manipulation"
      >
        I'm awake
      </button>

      <p className="text-sm text-[var(--color-text-muted)]">
        You can adjust the start time after
      </p>
    </div>
  );
}

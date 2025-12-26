import { useDayStore } from '@/store/dayStore';
import { formatDuration, formatDelta, formatTime } from '@/lib/time';

export function DayMetrics() {
  const { metrics } = useDayStore();

  if (!metrics) return null;

  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-6 border border-[var(--color-border)]">
      <div className="grid grid-cols-2 gap-4 text-center">
        <MetricItem
          label="Total Planned"
          value={formatDuration(metrics.totalPlannedMinutes)}
        />
        <MetricItem
          label="Delta"
          value={formatDelta(metrics.totalDeltaMinutes)}
          className={
            metrics.totalDeltaMinutes > 0
              ? 'text-[var(--color-warning)]'
              : 'text-[var(--color-success)]'
          }
        />
        <MetricItem label="Work Time" value={formatDuration(metrics.workMinutes)} />
        <MetricItem
          label="Movement"
          value={formatDuration(metrics.movementMinutes)}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 text-center">
        {metrics.plannedBedtime && (
          <div>
            <div className="text-xs text-[var(--color-text-muted)] mb-1">
              Planned Bedtime
            </div>
            <div className="font-semibold">{formatTime(metrics.plannedBedtime)}</div>
          </div>
        )}
        {metrics.forecastBedtime && (
          <div>
            <div className="text-xs text-[var(--color-text-muted)] mb-1">
              Forecast Bedtime
            </div>
            <div className="font-semibold">{formatTime(metrics.forecastBedtime)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <div className="text-xs text-[var(--color-text-muted)] mb-1">{label}</div>
      <div className={`text-lg font-semibold ${className}`}>{value}</div>
    </div>
  );
}

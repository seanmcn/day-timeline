import { motion } from 'framer-motion';
import { Target, Briefcase, Dumbbell, Coffee, Clock, Tag, type LucideIcon } from 'lucide-react';
import { useDayStore } from '@/store/dayStore';
import { formatDuration, formatTime } from '@/lib/time';

// Known category config - falls back to Tag for unknown categories
const categoryConfig: Record<string, { icon: LucideIcon; color: string }> = {
  work: { icon: Briefcase, color: 'text-blue-400' },
  movement: { icon: Dumbbell, color: 'text-green-400' },
  leisure: { icon: Coffee, color: 'text-purple-400' },
  routine: { icon: Clock, color: 'text-orange-400' },
};

const defaultConfig = { icon: Tag, color: 'text-[hsl(var(--muted-foreground))]' };

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DayMetrics() {
  const { metrics } = useDayStore();

  if (!metrics) return null;

  const categories = Object.entries(metrics.categories).filter(
    ([_, data]) => data.planned > 0 || data.actual > 0
  );

  const totalDelta = metrics.totalActualMinutes - metrics.totalPlannedMinutes;
  const totalDeltaColor = totalDelta > 0 ? 'text-[hsl(var(--destructive))]' : totalDelta < 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4 mb-4 space-y-3"
    >
      {/* Category Breakdown */}
      <div className="space-y-2">
        {categories.map(([category, data], index) => {
          const config = categoryConfig[category] || defaultConfig;
          const Icon = config.icon;
          const delta = data.actual - data.planned;
          const deltaColor = delta > 0 ? 'text-[hsl(var(--destructive))]' : delta < 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]';

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={config.color} />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {capitalizeFirst(category)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {formatDuration(data.planned)}
                </span>
                <span className="text-[hsl(var(--border))]">/</span>
                <span className={deltaColor}>
                  {formatDuration(data.actual)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-[hsl(var(--border)/0.5)]" />

      {/* Total */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-between"
      >
        <span className="text-sm font-medium">Total</span>
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-[hsl(var(--muted-foreground))]">
            {formatDuration(metrics.totalPlannedMinutes)}
          </span>
          <span className="text-[hsl(var(--border))]">/</span>
          <span className={totalDeltaColor}>
            {formatDuration(metrics.totalActualMinutes)}
          </span>
        </div>
      </motion.div>

      {/* Expected End */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-1"
      >
        <div className="flex items-center gap-2">
          <Target size={14} className="text-[hsl(var(--primary))]" />
          <span className="text-sm font-medium">Expected End</span>
        </div>
        <span className="text-sm font-semibold text-[hsl(var(--primary))]">
          {metrics.forecastBedtime ? formatTime(metrics.forecastBedtime) : '--'}
        </span>
      </motion.div>
    </motion.div>
  );
}

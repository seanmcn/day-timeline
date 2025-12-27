import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sigma } from 'lucide-react';
import { useDayStore } from '@/store/dayStore';
import { useCategoryStore } from '@/store/categoryStore';
import { formatDuration, formatTime } from '@/lib/time';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

export function DayMetrics() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { metrics } = useDayStore();

  const handleToggle = () => setIsExpanded((prev) => !prev);
  const allCategories = useCategoryStore((state) => state.categories);

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
      className="glass-card p-4 mb-4 cursor-pointer select-none"
      onDoubleClick={handleToggle}
      onTouchEnd={(e) => {
        // Single tap on touch devices
        if (e.changedTouches.length === 1) {
          handleToggle();
        }
      }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Category Breakdown */}
            <div className="space-y-2">
              {categories.map(([categoryId, data], index) => {
                const categoryData = allCategories.find((c) => c.id === categoryId);
                const color = categoryData?.color ?? '210 15% 50%';
                const delta = data.actual - data.planned;
                const deltaColor = delta > 0 ? 'text-[hsl(var(--destructive))]' : delta < 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]';

                return (
                  <motion.div
                    key={categoryId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${color} / 0.2)` }}
                      >
                        <DynamicIcon
                          name={categoryData?.icon ?? 'circle'}
                          size={12}
                          style={{ color: `hsl(${color})` }}
                        />
                      </div>
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        {categoryData?.name ?? categoryId}
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
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center bg-[hsl(var(--secondary))]"
                >
                  <Sigma size={12} className="text-[hsl(var(--foreground))]" />
                </div>
                <span className="text-sm font-medium">Total</span>
              </div>
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
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center bg-[hsl(var(--primary)/0.2)]"
                >
                  <Target size={12} className="text-[hsl(var(--primary))]" />
                </div>
                <span className="text-sm font-medium">Expected End</span>
              </div>
              <span className="text-sm font-semibold text-[hsl(var(--primary))]">
                {metrics.forecastBedtime ? formatTime(metrics.forecastBedtime) : '--'}
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-2"
          >
            {/* Category icons with times */}
            <div className="flex items-center gap-3">
              {categories.map(([categoryId, data]) => {
                const categoryData = allCategories.find((c) => c.id === categoryId);
                const color = categoryData?.color ?? '210 15% 50%';
                const delta = data.actual - data.planned;
                const deltaColor = delta > 0 ? 'text-[hsl(var(--destructive))]' : delta < 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]';

                return (
                  <div key={categoryId} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${color} / 0.2)` }}
                    >
                      <DynamicIcon
                        name={categoryData?.icon ?? 'circle'}
                        size={10}
                        style={{ color: `hsl(${color})` }}
                      />
                    </div>
                    <span className={`text-xs font-mono ${deltaColor}`}>
                      {formatDuration(data.actual)}
                    </span>
                  </div>
                );
              })}

              {/* Divider */}
              <div className="w-px h-4 bg-[hsl(var(--border)/0.5)]" />

              {/* Total */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--secondary))]">
                  <Sigma size={10} className="text-[hsl(var(--foreground))]" />
                </div>
                <span className={`text-xs font-mono ${totalDeltaColor}`}>
                  {formatDuration(metrics.totalActualMinutes)}
                </span>
              </div>
            </div>

            {/* Expected End */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--primary)/0.2)]">
                <Target size={10} className="text-[hsl(var(--primary))]" />
              </div>
              <span className="text-xs font-semibold text-[hsl(var(--primary))]">
                {metrics.forecastBedtime ? formatTime(metrics.forecastBedtime) : '--'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

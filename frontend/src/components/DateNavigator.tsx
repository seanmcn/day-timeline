import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Settings2 } from 'lucide-react';
import { getTodayKey, formatDateKey } from '@day-timeline/shared';
import { DaySettingsModal } from '@/components/modals';

interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

function formatDisplayDate(dateKey: string): string {
  const date = new Date(dateKey + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(dateKey + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const today = getTodayKey();
  const isToday = currentDate === today;

  const handlePrevious = () => {
    onDateChange(addDays(currentDate, -1));
  };

  const handleNext = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(today);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4 relative"
      >
        {/* Settings button - top right on desktop only */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSettingsOpen(true)}
          className="action-button p-1.5 absolute top-2 right-2 hidden lg:flex"
          aria-label="Day settings"
        >
          <Settings2 size={16} />
        </motion.button>

        {/* Mobile layout */}
        <div className="flex items-center justify-between lg:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            className="action-button p-2"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="flex flex-col items-center gap-1">
            <div className="relative flex items-center">
              <span className="text-lg font-heading font-semibold">
                {formatDisplayDate(currentDate)}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSettingsOpen(true)}
                className="action-button p-1.5 absolute -right-10"
                aria-label="Day settings"
              >
                <Settings2 size={16} />
              </motion.button>
            </div>
            {!isToday && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] transition-colors"
              >
                <Calendar size={12} />
                Back to Today
              </motion.button>
            )}
            {isToday && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Today
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="action-button p-2"
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex flex-col items-center gap-2">
          <span className="text-base font-heading font-semibold">
            {formatDisplayDate(currentDate)}
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className="action-button p-2"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </motion.button>
            {!isToday ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] transition-colors px-2"
              >
                <Calendar size={12} />
                Back to Today
              </motion.button>
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground))] px-2">
                Today
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="action-button p-2"
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <DaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

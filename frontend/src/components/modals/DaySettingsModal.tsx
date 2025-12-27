import { motion } from 'framer-motion';
import { Clock, RotateCcw } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useDayStore } from '@/store/dayStore';
import { getTimeInputValue, setTimeFromInput } from '@/lib/time';

interface DaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DaySettingsModal({ isOpen, onClose }: DaySettingsModalProps) {
  const { dayState, updateDayStart, resetDay } = useDayStore();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dayState?.dayStartAt) return;
    const newTime = setTimeFromInput(dayState.dayStartAt, e.target.value);
    updateDayStart(newTime);
  };

  const handleReset = () => {
    if (confirm('Reset day? This will delete all progress and reload from your templates.')) {
      resetDay();
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Day Settings">
      <div className="space-y-6">
        {/* Start Time */}
        {dayState?.dayStartAt && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
              <Clock size={16} className="text-[hsl(var(--primary))]" />
              Day Start Time
            </label>
            <input
              type="time"
              value={getTimeInputValue(dayState.dayStartAt)}
              onChange={handleTimeChange}
              className="w-full px-3 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-base"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Adjusting this will shift all planned block times.
            </p>
          </div>
        )}

        {/* Reset Day */}
        <div className="pt-4 border-t border-[hsl(var(--border))]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.2)] transition-colors font-medium"
          >
            <RotateCcw size={18} />
            Reset Day
          </motion.button>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] text-center">
            This will delete all blocks and reload from your templates.
          </p>
        </div>
      </div>
    </Dialog>
  );
}

import { motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';

interface CompletionCountdownProps {
  secondsRemaining: number;
  onUndo: () => void;
}

export function CompletionCountdown({
  secondsRemaining,
  onUndo,
}: CompletionCountdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-[hsl(var(--background)/0.9)] backdrop-blur-sm rounded-xl"
    >
      <div className="flex items-center gap-4">
        {/* Countdown number */}
        <motion.div
          key={secondsRemaining}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-full bg-[hsl(var(--success)/0.2)] flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-[hsl(var(--success))]">
            {secondsRemaining}
          </span>
        </motion.div>

        {/* Text */}
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Moving to completed...
        </div>

        {/* Undo button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted)/0.8)] text-[hsl(var(--foreground))] font-medium transition-colors"
        >
          <Undo2 size={16} />
          Undo
        </motion.button>
      </div>
    </motion.div>
  );
}

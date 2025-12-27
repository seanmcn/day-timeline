import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

interface LiveTimerProps {
  isActive: boolean;
  actualMinutes: number;
  estimateMinutes: number;
}

function formatTimer(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const secs = Math.floor((totalMinutes * 60) % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LiveTimer({ isActive, actualMinutes, estimateMinutes }: LiveTimerProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const progress = Math.min((actualMinutes / estimateMinutes) * 100, 100);
  const isOvertime = actualMinutes > estimateMinutes;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-[hsl(var(--primary))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Elapsed</span>
        </div>
        <motion.span
          key={Math.floor(actualMinutes * 60)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className={`font-mono text-lg font-semibold ${
            isOvertime ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--primary))]'
          }`}
        >
          {formatTimer(actualMinutes)}
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isOvertime ? 'bg-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary))]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
        <span>0:00</span>
        <span>{estimateMinutes}m est.</span>
      </div>
    </motion.div>
  );
}

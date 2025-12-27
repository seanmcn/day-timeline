import { motion } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface CompletedBlocksToggleProps {
  count: number;
  showInMainList: boolean;
  onToggle: () => void;
}

export function CompletedBlocksToggle({
  count,
  showInMainList,
  onToggle,
}: CompletedBlocksToggleProps) {
  if (count === 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onToggle}
      className="lg:hidden w-full glass-card p-3 mb-4 flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-[hsl(var(--success))]" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {count} completed block{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="p-1.5 rounded-lg">
        {showInMainList ? (
          <Eye size={16} className="text-[hsl(var(--primary))]" />
        ) : (
          <EyeOff size={16} className="text-[hsl(var(--muted-foreground))]" />
        )}
      </div>
    </motion.button>
  );
}

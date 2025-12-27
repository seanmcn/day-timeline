import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddBlockButtonProps {
  onClick: () => void;
}

export function AddBlockButton({ onClick }: AddBlockButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full glass-card border-dashed border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] py-3 px-4 flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all duration-300 group"
    >
      <div className="w-6 h-6 rounded-full bg-[hsl(var(--secondary))] group-hover:bg-[hsl(var(--primary)/0.2)] flex items-center justify-center transition-colors">
        <Plus size={14} className="group-hover:text-[hsl(var(--primary))]" />
      </div>
      <span className="text-sm font-medium">Add Block</span>
    </motion.button>
  );
}

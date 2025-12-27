import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { useCategoryStore } from '@/store/categoryStore';
import { formatDuration, formatTime } from '@/lib/time';

interface CompletedBlocksSidebarProps {
  blocks: Block[];
  showInMainList: boolean;
  onToggleShowInMainList: () => void;
}

export function CompletedBlocksSidebar({
  blocks,
  showInMainList,
  onToggleShowInMainList,
}: CompletedBlocksSidebarProps) {
  const { uncompleteBlock } = useDayStore();
  const allCategories = useCategoryStore((state) => state.categories);

  if (blocks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden lg:block glass-card p-4 mt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Completed
          </h3>
          <span className="px-1.5 py-0.5 text-xs font-medium bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))] rounded-full">
            {blocks.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleShowInMainList}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          title={showInMainList ? 'Hide in main list' : 'Show in main list'}
        >
          {showInMainList ? (
            <Eye size={16} className="text-[hsl(var(--primary))]" />
          ) : (
            <EyeOff size={16} className="text-[hsl(var(--muted-foreground))]" />
          )}
        </motion.button>
      </div>

      {/* Completed blocks list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {blocks.map((block) => {
            const category = allCategories.find((c) => c.id === block.category);
            const categoryColor = category?.color ?? '210 15% 50%';
            const actualMinutes = calculateBlockActualMinutes(block);

            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                layout
                className="flex items-center gap-2 text-xs group"
              >
                {/* Category indicator */}
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(${categoryColor})` }}
                />

                {/* Block info */}
                <div className="flex-1 min-w-0 truncate text-[hsl(var(--muted-foreground))]">
                  <span className="text-[hsl(var(--foreground))] font-medium">
                    {block.label}
                  </span>
                  <span className="mx-1.5">-</span>
                  <span className="font-mono">
                    {formatDuration(block.estimateMinutes, false)}
                  </span>
                  <span className="mx-1">/ </span>
                  <span
                    className={`font-mono ${
                      actualMinutes > block.estimateMinutes
                        ? 'text-[hsl(var(--destructive))]'
                        : 'text-[hsl(var(--success))]'
                    }`}
                  >
                    {formatDuration(actualMinutes, false)}
                  </span>
                  {block.completedAt && (
                    <>
                      <span className="mx-1">/ </span>
                      <span>{formatTime(block.completedAt)}</span>
                    </>
                  )}
                </div>

                {/* Undo button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => uncompleteBlock(block.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))] transition-all"
                  title="Restore"
                >
                  <RotateCcw size={12} className="text-[hsl(var(--muted-foreground))]" />
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

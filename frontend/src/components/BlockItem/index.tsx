import { forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  Play,
  Pause,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { useCategoryStore } from '@/store/categoryStore';
import { SwipeableWrapper } from './SwipeableWrapper';
import { LiveTimer } from './LiveTimer';
import { TaskList } from '@/components/tasks';
import { formatTime, formatDuration } from '@/lib/time';

interface BlockItemProps {
  block: Block;
  index: number;
  dayStartAt: string | null;
  previousBlocks: Block[];
  onEdit: (block: Block) => void;
}

export const BlockItem = forwardRef<HTMLDivElement, BlockItemProps>(function BlockItem(
  { block, index, dayStartAt, previousBlocks, onEdit },
  forwardedRef
) {
  const {
    duplicateBlock,
    deleteBlock,
    completeBlock,
    uncompleteBlock,
    startSession,
    stopSession,
    toggleTask,
    metrics,
  } = useDayStore();

  const allCategories = useCategoryStore((state) => state.categories);
  const category = allCategories.find((c) => c.id === block.category);
  const categoryColor = category?.color ?? '210 15% 50%';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  // Merge the forwarded ref with the sortable ref
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [setNodeRef, forwardedRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = metrics?.currentBlockId === block.id;
  const hasActiveSession = block.sessions.some((s) => s.endedAt === null);
  const actualMinutes = calculateBlockActualMinutes(block);

  // Calculate planned time
  const plannedTime = (() => {
    if (!dayStartAt) return null;
    const previousMinutes = previousBlocks.reduce((sum, b) => {
      if (b.completed) {
        return sum + calculateBlockActualMinutes(b);
      }
      return sum + b.estimateMinutes;
    }, 0);
    const planned = new Date(dayStartAt);
    planned.setMinutes(planned.getMinutes() + previousMinutes);
    return planned.toISOString();
  })();

  const blockState = block.completed ? 'completed' : isActive ? 'active' : '';

  const handleDone = () => completeBlock(block.id);
  const handleUndo = () => uncompleteBlock(block.id);
  const handleEdit = () => onEdit(block);
  const handleDuplicate = () => duplicateBlock(block.id);
  const handleDelete = () => deleteBlock(block.id);

  return (
    <motion.div
      ref={mergedRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <SwipeableWrapper
        onSwipeRight={block.completed ? handleUndo : handleDone}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        isCompleted={block.completed}
        disabled={false}
      >
        <div
          className={`timeline-block glass-card-hover p-4 ${blockState}`}
          style={{
            borderLeftWidth: '4px',
            borderLeftColor: `hsl(${categoryColor})`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="drag-handle pt-1 touch-none"
            >
              <GripVertical size={18} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-heading font-semibold text-base ${
                        block.completed
                          ? 'line-through text-[hsl(var(--muted-foreground))]'
                          : ''
                      }`}
                    >
                      {block.label}
                    </h3>
                    {block.completed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))] rounded-full text-xs font-medium"
                      >
                        <CheckCircle2 size={12} />
                        Done
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] rounded-full text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full animate-pulse" />
                        Active
                      </motion.span>
                    )}
                  </div>
                  {plannedTime && (
                    <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {formatTime(plannedTime)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="action-button"
                    aria-label="Edit"
                  >
                    <Pencil size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDuplicate}
                    className="action-button"
                    aria-label="Duplicate"
                  >
                    <Copy size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="action-button hover:text-[hsl(var(--destructive))]"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Duration and Controls */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border)/0.3)]">
                <div className="flex items-center gap-4 text-sm font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[hsl(var(--muted-foreground))] font-sans">Est:</span>
                    <span>{formatDuration(block.estimateMinutes, false)}</span>
                  </div>
                  {(actualMinutes > 0 || block.completed) && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[hsl(var(--muted-foreground))] font-sans">Act:</span>
                      <span
                        className={
                          actualMinutes > block.estimateMinutes
                            ? 'text-[hsl(var(--destructive))]'
                            : 'text-[hsl(var(--success))]'
                        }
                      >
                        {formatDuration(actualMinutes, false)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!block.completed && (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDone}
                        className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.3)] active:bg-[hsl(var(--success)/0.4)] transition-colors flex items-center justify-center gap-1.5 text-sm font-medium"
                        aria-label="Mark complete"
                      >
                        <Check size={18} />
                        <span className="hidden sm:inline">Done</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          hasActiveSession
                            ? stopSession(block.id)
                            : startSession(block.id)
                        }
                        className={`min-w-[44px] min-h-[44px] px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm font-medium ${
                          hasActiveSession
                            ? 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]'
                            : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] glow-primary'
                        }`}
                        aria-label={hasActiveSession ? 'Pause' : 'Start'}
                      >
                        {hasActiveSession ? (
                          <Pause size={18} />
                        ) : (
                          <Play size={18} className="ml-0.5" />
                        )}
                        <span className="hidden sm:inline">
                          {hasActiveSession ? 'Pause' : 'Start'}
                        </span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Live Timer */}
              <LiveTimer
                isActive={hasActiveSession}
                actualMinutes={actualMinutes}
                estimateMinutes={block.estimateMinutes}
              />

              {/* Sub Tasks */}
              {block.tasks.length > 0 && (
                <TaskList
                  tasks={block.tasks}
                  blockId={block.id}
                  onToggleTask={(taskId) => toggleTask(block.id, taskId)}
                />
              )}
            </div>
          </div>
        </div>
      </SwipeableWrapper>
    </motion.div>
  );
});

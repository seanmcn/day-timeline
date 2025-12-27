import { forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { type Block, calculateBlockActualMinutes } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { useCategoryStore } from '@/store/categoryStore';
import { SwipeableWrapper } from './SwipeableWrapper';
import { LiveTimer } from './LiveTimer';
import { CompletionCountdown } from './CompletionCountdown';
import { TaskList } from '@/components/tasks';
import { formatTime, formatDuration } from '@/lib/time';

interface BlockItemProps {
  block: Block;
  index: number;
  dayStartAt: string | null;
  previousBlocks: Block[];
  onEdit: (block: Block) => void;
  isPendingCompletion?: boolean;
  countdownSeconds?: number;
  onStartCountdown?: (blockId: string) => void;
  onCancelCountdown?: (blockId: string) => void;
}

export const BlockItem = forwardRef<HTMLDivElement, BlockItemProps>(function BlockItem(
  {
    block,
    index,
    dayStartAt,
    previousBlocks,
    onEdit,
    isPendingCompletion = false,
    countdownSeconds = 0,
    onStartCountdown,
    onCancelCountdown,
  },
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
  const hasBeenStarted = block.sessions.length > 0;
  const isPaused = hasBeenStarted && !hasActiveSession && !block.completed;
  const actualMinutes = calculateBlockActualMinutes(block);

  // Calculate planned and projected times (accounting for delays)
  const { projectedTime, delayMinutes } = (() => {
    if (!dayStartAt) return { projectedTime: null, delayMinutes: 0 };

    const now = new Date();
    const cumulativePlanned = new Date(dayStartAt);
    let cumulativeProjected = new Date(dayStartAt);

    for (const b of previousBlocks) {
      if (b.completed) {
        const actual = calculateBlockActualMinutes(b);
        cumulativePlanned.setMinutes(cumulativePlanned.getMinutes() + actual);
        cumulativeProjected.setMinutes(cumulativeProjected.getMinutes() + actual);
      } else if (b.sessions.length > 0) {
        // Started but not completed - use actual start time and current elapsed time
        const startedAt = new Date(b.sessions[0].startedAt);
        cumulativePlanned.setMinutes(cumulativePlanned.getMinutes() + b.estimateMinutes);
        // Jump to when this block actually started if we're behind
        if (cumulativeProjected < startedAt) {
          cumulativeProjected = new Date(startedAt);
        }
        cumulativeProjected.setMinutes(cumulativeProjected.getMinutes() + calculateBlockActualMinutes(b));
      } else {
        // Not started - use estimate for planned
        cumulativePlanned.setMinutes(cumulativePlanned.getMinutes() + b.estimateMinutes);

        // For projected, if we're behind NOW, jump to now
        if (cumulativeProjected < now) {
          cumulativeProjected = new Date(now);
        }
        cumulativeProjected.setMinutes(cumulativeProjected.getMinutes() + b.estimateMinutes);
      }
    }

    // For current block: use actual start time if started, otherwise use now if behind
    if (block.sessions.length > 0) {
      // Block has been started - use the actual start time
      cumulativeProjected = new Date(block.sessions[0].startedAt);
    } else if (!block.completed && cumulativeProjected < now) {
      cumulativeProjected = new Date(now);
    }

    const projectedTime = cumulativeProjected.toISOString();
    const delayMs = cumulativeProjected.getTime() - cumulativePlanned.getTime();
    const delayMinutes = Math.max(0, Math.floor(delayMs / 60000));

    return { projectedTime, delayMinutes };
  })();

  const blockState = block.completed ? 'completed' : isActive ? 'active' : '';

  const handleDone = () => {
    if (onStartCountdown) {
      onStartCountdown(block.id);
    } else {
      completeBlock(block.id);
    }
  };
  const handleUndo = () => {
    if (isPendingCompletion && onCancelCountdown) {
      onCancelCountdown(block.id);
    } else {
      uncompleteBlock(block.id);
    }
  };
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
          className={`timeline-block glass-card-hover p-4 group ${blockState}`}
          style={{
            borderLeftWidth: '4px',
            borderLeftColor: `hsl(${categoryColor})`,
          }}
        >
          {/* Countdown overlay */}
          <AnimatePresence>
            {isPendingCompletion && (
              <CompletionCountdown
                secondsRemaining={countdownSeconds}
                onUndo={handleUndo}
              />
            )}
          </AnimatePresence>

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
                  {projectedTime && (
                    <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {formatTime(projectedTime)}
                      {delayMinutes > 5 && (
                        <span className="ml-2 text-xs text-orange-400">
                          +{formatDuration(delayMinutes, false)} behind
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons - desktop only, swipe left on mobile */}
                <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                {/* Only show Est/Act when timer is not visible */}
                {!hasActiveSession && !isPaused ? (
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
                ) : (
                  <div />
                )}

                {/* Only show Start button when block hasn't been started yet */}
                {!block.completed && !hasBeenStarted && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startSession(block.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] glow-primary"
                    aria-label="Start"
                  >
                    <Play size={18} className="ml-0.5" />
                  </motion.button>
                )}
              </div>

              {/* Live Timer */}
              <LiveTimer
                isRunning={hasActiveSession}
                isPaused={isPaused}
                actualMinutes={actualMinutes}
                estimateMinutes={block.estimateMinutes}
                onToggle={() => hasActiveSession ? stopSession(block.id) : startSession(block.id)}
              />

              {/* Sub Tasks */}
              {block.tasks.length > 0 && (
                <TaskList
                  tasks={block.tasks}
                  blockId={block.id}
                  isBlockCompleted={block.completed}
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

import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type Block } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { useCompletionCountdown } from '@/hooks/useCompletionCountdown';
import { BlockItem } from './BlockItem/index';
import { ContinuationItem } from './BlockItem/ContinuationItem';
import { computeTimelineSegments } from '@/lib/timeline';

interface BlockListProps {
  onEditBlock: (block: Block) => void;
  showCompletedInList?: boolean;
}

export function BlockList({ onEditBlock, showCompletedInList = false }: BlockListProps) {
  const { dayState, reorderBlocks } = useDayStore();
  const {
    startCountdown,
    cancelCountdown,
    isPending,
    getSecondsRemaining,
  } = useCompletionCountdown();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  const sortedBlocks = useMemo(
    () => dayState ? [...dayState.blocks].sort((a, b) => a.order - b.order) : [],
    [dayState]
  );

  const segments = useMemo(
    () => dayState ? computeTimelineSegments(dayState.blocks, dayState.dayStartAt) : [],
    [dayState]
  );

  if (!dayState) return null;

  // Filter segments based on visibility rules
  const visibleSegments = segments.filter((segment) => {
    const block = segment.block;
    if (!block.completed) return true;
    if (isPending(block.id)) return true;
    if (showCompletedInList) return true;
    return false;
  });

  // DnD only operates on real blocks (not continuations)
  const sortableIds = visibleSegments
    .filter((s) => s.type === 'block')
    .map((s) => s.block.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleSegments.map((segment, index) => {
              if (segment.type === 'continuation') {
                return (
                  <ContinuationItem
                    key={`${segment.block.id}-cont`}
                    segment={segment}
                  />
                );
              }

              const block = segment.block;
              const blockIsPending = isPending(block.id);
              return (
                <BlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  dayStartAt={dayState.dayStartAt}
                  previousBlocks={sortedBlocks.slice(0, sortedBlocks.findIndex((b) => b.id === block.id))}
                  onEdit={onEditBlock}
                  effectiveEstimate={segment.effectiveEstimate}
                  isPendingCompletion={blockIsPending}
                  countdownSeconds={blockIsPending ? getSecondsRemaining(block.id) : 0}
                  onStartCountdown={startCountdown}
                  onCancelCountdown={cancelCountdown}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}

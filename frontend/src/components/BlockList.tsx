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

  if (!dayState) return null;

  const sortedBlocks = [...dayState.blocks].sort((a, b) => a.order - b.order);

  // Filter blocks to show in main list:
  // - Show if not completed
  // - Show if in countdown (pending completion)
  // - Show if showCompletedInList is true
  const visibleBlocks = sortedBlocks.filter((block) => {
    if (!block.completed) return true;
    if (isPending(block.id)) return true;
    if (showCompletedInList) return true;
    return false;
  });

  const blockIds = visibleBlocks.map((b) => b.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleBlocks.map((block, index) => {
              const blockIsPending = isPending(block.id);
              return (
                <BlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  dayStartAt={dayState.dayStartAt}
                  previousBlocks={sortedBlocks.slice(0, sortedBlocks.findIndex((b) => b.id === block.id))}
                  onEdit={onEditBlock}
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

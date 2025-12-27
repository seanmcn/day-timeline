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
import { BlockItem } from './BlockItem/index';

interface BlockListProps {
  onEditBlock: (block: Block) => void;
}

export function BlockList({ onEditBlock }: BlockListProps) {
  const { dayState, reorderBlocks } = useDayStore();

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
  const blockIds = sortedBlocks.map((b) => b.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedBlocks.map((block, index) => (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                dayStartAt={dayState.dayStartAt}
                previousBlocks={sortedBlocks.slice(0, index)}
                onEdit={onEditBlock}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}

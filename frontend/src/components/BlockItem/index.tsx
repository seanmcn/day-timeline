import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Block } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { SwipeableWrapper } from './SwipeableWrapper';
import { BlockHeader } from './BlockHeader';
import { BlockTimeDisplay } from './BlockTimeDisplay';
import { BlockActions } from './BlockActions';
import { EditModeOverlay } from './EditModeOverlay';
import { TaskList } from '@/components/tasks';

interface BlockItemProps {
  block: Block;
  index: number;
  dayStartAt: string | null;
  previousBlocks: Block[];
}

export function BlockItem({
  block,
  index: _index,
  dayStartAt,
  previousBlocks,
}: BlockItemProps) {
  const {
    updateBlock,
    duplicateBlock,
    deleteBlock,
    completeBlock,
    uncompleteBlock,
    startSession,
    stopSession,
    toggleTask,
    metrics,
  } = useDayStore();

  const [isEditMode, setIsEditMode] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = metrics?.currentBlockId === block.id;
  const hasActiveSession = block.sessions.some((s) => s.endedAt === null);

  const categoryColors: Record<string, string> = {
    work: 'border-l-blue-500',
    movement: 'border-l-green-500',
    leisure: 'border-l-purple-500',
    routine: 'border-l-gray-500',
  };

  const handleDone = () => {
    completeBlock(block.id);
  };

  const handleUndo = () => {
    uncompleteBlock(block.id);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleEditSave = (updates: { estimateMinutes?: number; actualMinutesOverride?: number }) => {
    updateBlock(block.id, updates);
    setIsEditMode(false);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
  };

  const handleDuplicate = () => {
    duplicateBlock(block.id);
  };

  const handleDelete = () => {
    deleteBlock(block.id);
  };

  const handleTitleChange = (label: string) => {
    updateBlock(block.id, { label });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SwipeableWrapper
        onSwipeRight={block.completed ? handleUndo : handleDone}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        isCompleted={block.completed}
        disabled={isEditMode}
      >
        <div
          className={`rounded-xl border border-[var(--color-border)]
                      ${categoryColors[block.category]} border-l-4
                      ${isActive ? 'ring-2 ring-[var(--color-accent)]' : ''}
                      ${block.completed ? 'opacity-60' : ''}`}
        >
          <div className="p-4">
            {/* Header row */}
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <BlockHeader
                  block={block}
                  dayStartAt={dayStartAt}
                  previousBlocks={previousBlocks}
                  onTitleChange={handleTitleChange}
                  dragHandleProps={{ attributes, listeners }}
                />
              </div>

              {/* Desktop action icons */}
              <BlockActions
                isCompleted={block.completed}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>

            {/* Edit mode overlay */}
            {isEditMode && (
              <EditModeOverlay
                block={block}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
              />
            )}

            {/* Time display and play button row */}
            {!isEditMode && (
              <div className="flex items-center justify-between mt-2">
                <BlockTimeDisplay
                  block={block}
                  hasActiveSession={hasActiveSession}
                  isEditMode={isEditMode}
                />

                {/* Play/Stop button - hidden when completed */}
                {!block.completed && (
                  <button
                    onClick={() =>
                      hasActiveSession ? stopSession(block.id) : startSession(block.id)
                    }
                    className={`p-3 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${
                      hasActiveSession
                        ? 'bg-[var(--color-error)] hover:bg-[var(--color-error)]/90'
                        : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90'
                    }`}
                    aria-label={hasActiveSession ? 'Stop tracking' : 'Start tracking'}
                  >
                    {hasActiveSession ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                        <rect x="4" y="4" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Task list - show when not in edit mode and block has tasks */}
            {!isEditMode && block.tasks.length > 0 && (
              <TaskList
                tasks={block.tasks}
                blockId={block.id}
                onToggleTask={(taskId) => toggleTask(block.id, taskId)}
              />
            )}
          </div>
        </div>
      </SwipeableWrapper>
    </div>
  );
}

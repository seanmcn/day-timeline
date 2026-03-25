import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, GripVertical, Undo2 } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTemplateStore } from '@/store/templateStore';
import { useCategoryStore } from '@/store/categoryStore';
import { TemplateEditor } from './TemplateEditor';
import type { BlockTemplate } from '@day-timeline/shared';

const DELETE_COUNTDOWN_SECONDS = 5;

interface PendingDelete {
  templateId: string;
  startedAt: number;
}

function SortableTemplateItem({
  template,
  index,
  isEditing,
  isPendingDelete,
  countdownSeconds,
  getCategoryColor,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onUndoDelete,
}: {
  template: BlockTemplate;
  index: number;
  isEditing: boolean;
  isPendingDelete: boolean;
  countdownSeconds: number;
  getCategoryColor: (id: string) => string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: Partial<BlockTemplate>) => void;
  onDelete: () => void;
  onUndoDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id, disabled: isEditing || isPendingDelete });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isPendingDelete) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ delay: index * 0.03 }}
        layout
      >
        <div className="glass-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                key={countdownSeconds}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-8 h-8 rounded-full bg-[hsl(var(--destructive)/0.2)] flex items-center justify-center"
              >
                <span className="text-lg font-bold text-[hsl(var(--destructive))]">
                  {countdownSeconds}
                </span>
              </motion.div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Deleting &ldquo;{template.name}&rdquo;...
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndoDelete}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted)/0.8)] text-[hsl(var(--foreground))] text-sm font-medium transition-colors"
            >
              <Undo2 size={14} />
              Undo
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ delay: index * 0.03 }}
        layout
      >
        <TemplateEditor
          template={template}
          onSave={onSave}
          onCancel={onCancelEdit}
          onDelete={onDelete}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <div
        className={`glass-card-hover relative overflow-hidden ${template.isHidden ? 'opacity-50' : ''}`}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: `hsl(${getCategoryColor(template.category)})`,
        }}
      >
        <div className="flex items-center">
          <div
            {...attributes}
            {...listeners}
            className="drag-handle pl-3 py-4 touch-none cursor-grab"
          >
            <GripVertical size={16} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <button
            onClick={onEdit}
            className="flex-1 p-4 pl-2 text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {template.defaultMinutes}m
                  </span>
                  {template.tasks.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                      {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {template.isHidden && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      (hidden)
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-[hsl(var(--muted-foreground))]" />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function TemplateList() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, reorderTemplates } = useTemplateStore();
  const allCategories = useCategoryStore((state) => state.categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [, forceUpdate] = useState({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const categories = allCategories.filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  const sortedTemplates = [...templates].sort((a, b) => a.order - b.order);
  const defaultCategory = categories[0]?.id ?? 'routine';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getCategoryColor = (id: string) => {
    const cat = allCategories.find((c) => c.id === id);
    return cat?.color ?? '210 15% 50%';
  };

  const handleAdd = () => {
    const newTemplate: Omit<BlockTemplate, 'id' | 'order'> = {
      name: 'New Block',
      defaultMinutes: 60,
      category: defaultCategory,
      tasks: [],
      useTaskEstimates: false,
      isDefault: false,
      isHidden: false,
    };
    addTemplate(newTemplate);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTemplates(active.id as string, over.id as string);
    }
  };

  const startDelete = useCallback((templateId: string) => {
    setEditingId(null);
    setPendingDelete({ templateId, startedAt: Date.now() });
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const getSecondsRemaining = useCallback((): number => {
    if (!pendingDelete) return 0;
    const elapsed = Math.floor((Date.now() - pendingDelete.startedAt) / 1000);
    return Math.max(0, DELETE_COUNTDOWN_SECONDS - elapsed);
  }, [pendingDelete]);

  // Countdown timer for pending delete
  useEffect(() => {
    if (!pendingDelete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pendingDelete.startedAt) / 1000);
      if (elapsed >= DELETE_COUNTDOWN_SECONDS) {
        deleteTemplate(pendingDelete.templateId);
        setPendingDelete(null);
      }
      forceUpdate({});
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingDelete, deleteTemplate]);

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedTemplates.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {sortedTemplates.map((template, index) => (
              <SortableTemplateItem
                key={template.id}
                template={template}
                index={index}
                isEditing={editingId === template.id}
                isPendingDelete={pendingDelete?.templateId === template.id}
                countdownSeconds={pendingDelete?.templateId === template.id ? getSecondsRemaining() : 0}
                getCategoryColor={getCategoryColor}
                onEdit={() => setEditingId(template.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(updates) => {
                  updateTemplate(template.id, updates);
                  setEditingId(null);
                }}
                onDelete={() => startDelete(template.id)}
                onUndoDelete={cancelDelete}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Add new template button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAdd}
        className="w-full glass-card border-dashed border-2 border-[hsl(var(--border))]
                   text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]
                   hover:border-[hsl(var(--primary)/0.5)] transition-all
                   flex items-center justify-center gap-2 p-4"
      >
        <Plus size={16} />
        Add Block Template
      </motion.button>
    </div>
  );
}

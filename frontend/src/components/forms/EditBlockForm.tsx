import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { type Block, type BlockCategory, generateId } from '@day-timeline/shared';
import { useCategoryStore } from '@/store/categoryStore';
import { DurationInput } from '@/components/ui/DurationInput';

interface EditBlockFormProps {
  block: Block;
  onSave: (blockId: string, updates: Partial<Block>) => void;
  onClose: () => void;
  live?: boolean;
}

export function EditBlockForm({ block, onSave, onClose, live }: EditBlockFormProps) {
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = allCategories.filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<BlockCategory>('work');
  const [estimateMinutes, setEstimateMinutes] = useState(60);
  const [actualMinutesOverride, setActualMinutesOverride] = useState<number | undefined>();
  const [tasks, setTasks] = useState<{ id: string; name: string; estimateMinutes: number }[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const initialized = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    initialized.current = false;
    setLabel(block.label);
    setCategory(block.category);
    setEstimateMinutes(block.estimateMinutes);
    setActualMinutesOverride(block.actualMinutesOverride);
    setIsPinned(!!block.scheduledAt);
    setScheduledTime(block.scheduledAt ?? '');
    setTasks(
      block.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        estimateMinutes: t.estimateMinutes || 0,
      }))
    );
    // Mark as initialized after state has settled
    requestAnimationFrame(() => { initialized.current = true; });
  }, [block]);

  const buildUpdates = useCallback((): Partial<Block> => ({
    label,
    category,
    estimateMinutes,
    actualMinutesOverride,
    scheduledAt: isPinned && scheduledTime ? scheduledTime : undefined,
    tasks: tasks.map((t, index) => ({
      ...block.tasks.find((bt) => bt.id === t.id) || {
        id: t.id,
        completed: false,
      },
      name: t.name,
      estimateMinutes: t.estimateMinutes,
      order: index,
    })),
  }), [label, category, estimateMinutes, actualMinutesOverride, isPinned, scheduledTime, tasks, block.tasks]);

  // Live auto-save with debounce
  useEffect(() => {
    if (!live || !initialized.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(block.id, buildUpdates());
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [live, label, category, estimateMinutes, actualMinutesOverride, isPinned, scheduledTime, tasks, block.id, buildUpdates, onSave]);

  const handleSave = () => {
    onSave(block.id, buildUpdates());
    onClose();
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    setTasks([...tasks, { id: generateId(), name: newTaskName.trim(), estimateMinutes: 15 }]);
    setNewTaskName('');
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleTaskChange = (taskId: string, field: 'name' | 'estimateMinutes', value: string | number) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Title
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          placeholder="Block name"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                category === cat.id
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(${cat.color})` }}
              />
              <span className="text-sm">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Estimate */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Estimated Duration
        </label>
        <DurationInput
          value={estimateMinutes}
          onChange={setEstimateMinutes}
          className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {/* Actual Override */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Actual Duration Override (optional)
        </label>
        <DurationInput
          value={actualMinutesOverride ?? 0}
          onChange={(mins) => setActualMinutesOverride(mins > 0 ? mins : undefined)}
          placeholder="Leave empty to use tracked time"
          className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {/* Pin to time */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded border-[hsl(var(--border))]"
          />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Pin to specific time
          </span>
        </label>
        {isPinned && (
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="mt-2 w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          />
        )}
      </div>

      {/* Tasks */}
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Tasks
        </label>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <input
                type="text"
                value={task.name}
                onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
                className="flex-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
              />
              <DurationInput
                value={task.estimateMinutes}
                onChange={(mins) => handleTaskChange(task.id, 'estimateMinutes', mins)}
                className="w-16 flex-shrink-0 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRemoveTask(task.id)}
                className="action-button p-2 flex-shrink-0 hover:text-[hsl(var(--destructive))]"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          ))}

          {/* Add new task */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a task..."
              className="flex-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              className="action-button p-2 hover:text-[hsl(var(--primary))]"
            >
              <Plus size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Actions - only shown in modal mode */}
      {!live && (
        <div className="flex gap-2 pt-4 border-t border-[hsl(var(--border)/0.5)]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Save
          </motion.button>
        </div>
      )}
    </div>
  );
}

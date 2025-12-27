import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { type Block, type BlockCategory, generateId } from '@day-timeline/shared';
import { Dialog } from '@/components/ui/Dialog';

interface EditBlockModalProps {
  block: Block | null;
  onClose: () => void;
  onSave: (blockId: string, updates: Partial<Block>) => void;
}

const CATEGORIES: { value: BlockCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'movement', label: 'Movement' },
  { value: 'routine', label: 'Routine' },
  { value: 'leisure', label: 'Leisure' },
];

export function EditBlockModal({ block, onClose, onSave }: EditBlockModalProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<BlockCategory>('work');
  const [estimateMinutes, setEstimateMinutes] = useState(60);
  const [actualMinutesOverride, setActualMinutesOverride] = useState<number | undefined>();
  const [tasks, setTasks] = useState<{ id: string; name: string; estimateMinutes: number }[]>([]);
  const [newTaskName, setNewTaskName] = useState('');

  useEffect(() => {
    if (block) {
      setLabel(block.label);
      setCategory(block.category);
      setEstimateMinutes(block.estimateMinutes);
      setActualMinutesOverride(block.actualMinutesOverride);
      setTasks(
        block.tasks.map((t) => ({
          id: t.id,
          name: t.name,
          estimateMinutes: t.estimateMinutes || 0,
        }))
      );
    }
  }, [block]);

  const handleSave = () => {
    if (!block) return;

    onSave(block.id, {
      label,
      category,
      estimateMinutes,
      actualMinutesOverride,
      tasks: tasks.map((t, index) => ({
        ...block.tasks.find((bt) => bt.id === t.id) || {
          id: t.id,
          completed: false,
        },
        name: t.name,
        estimateMinutes: t.estimateMinutes,
        order: index,
      })),
    });
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

  if (!block) return null;

  return (
    <Dialog isOpen={!!block} onClose={onClose} title="Edit Block">
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BlockCategory)}
            className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estimate */}
        <div>
          <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={estimateMinutes}
            onChange={(e) => setEstimateMinutes(parseInt(e.target.value) || 0)}
            step={15}
            min={0}
            className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          />
        </div>

        {/* Actual Override */}
        <div>
          <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
            Actual Duration Override (optional)
          </label>
          <input
            type="number"
            value={actualMinutesOverride ?? ''}
            onChange={(e) =>
              setActualMinutesOverride(e.target.value ? parseInt(e.target.value) : undefined)
            }
            step={15}
            min={0}
            placeholder="Leave empty to use tracked time"
            className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          />
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
                <input
                  type="number"
                  value={task.estimateMinutes}
                  onChange={(e) =>
                    handleTaskChange(task.id, 'estimateMinutes', parseInt(e.target.value) || 0)
                  }
                  step={5}
                  min={0}
                  className="w-20 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveTask(task.id)}
                  className="action-button p-2 hover:text-[hsl(var(--destructive))]"
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

        {/* Actions */}
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
      </div>
    </Dialog>
  );
}

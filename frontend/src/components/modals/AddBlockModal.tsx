import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { type BlockCategory, generateId } from '@day-timeline/shared';
import { Dialog } from '@/components/ui/Dialog';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (block: {
    label: string;
    category: BlockCategory;
    estimateMinutes: number;
    tasks: { id: string; name: string; estimateMinutes?: number; completed: boolean; order: number }[];
    notes: string;
    useTaskEstimates: boolean;
  }) => void;
}

const CATEGORIES: { value: BlockCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'movement', label: 'Movement' },
  { value: 'routine', label: 'Routine' },
  { value: 'leisure', label: 'Leisure' },
];

export function AddBlockModal({ isOpen, onClose, onAdd }: AddBlockModalProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<BlockCategory>('work');
  const [estimateMinutes, setEstimateMinutes] = useState(60);
  const [tasks, setTasks] = useState<{ id: string; name: string; estimateMinutes: number }[]>([]);
  const [newTaskName, setNewTaskName] = useState('');

  const handleSave = () => {
    if (!label.trim()) return;

    onAdd({
      label: label.trim(),
      category,
      estimateMinutes,
      tasks: tasks.map((t, index) => ({
        id: t.id,
        name: t.name,
        estimateMinutes: t.estimateMinutes,
        completed: false,
        order: index,
      })),
      notes: '',
      useTaskEstimates: false,
    });

    // Reset form
    setLabel('');
    setCategory('work');
    setEstimateMinutes(60);
    setTasks([]);
    setNewTaskName('');
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

  const handleClose = () => {
    // Reset form on close
    setLabel('');
    setCategory('work');
    setEstimateMinutes(60);
    setTasks([]);
    setNewTaskName('');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add Block">
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
            autoFocus
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

        {/* Tasks */}
        <div>
          <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
            Tasks (optional)
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
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Block
          </motion.button>
        </div>
      </div>
    </Dialog>
  );
}

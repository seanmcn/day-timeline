import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { useCategoryStore } from '@/store/categoryStore';
import type { BlockTemplate, BlockCategory, TaskTemplate } from '@day-timeline/shared';
import { calculateBlockEstimateFromTasks } from '@day-timeline/shared';

interface TemplateEditorProps {
  template: BlockTemplate;
  onSave: (updates: Partial<BlockTemplate>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function TemplateEditor({ template, onSave, onCancel, onDelete }: TemplateEditorProps) {
  const { addTaskToTemplate, updateTaskInTemplate, removeTaskFromTemplate } = useTemplateStore();
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = allCategories.filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);

  const [name, setName] = useState(template.name);
  const [defaultMinutes, setDefaultMinutes] = useState(template.defaultMinutes);
  const [category, setCategory] = useState<BlockCategory>(template.category);
  const [isHidden, setIsHidden] = useState(template.isHidden);
  const [useTaskEstimates, setUseTaskEstimates] = useState(template.useTaskEstimates);

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(15);

  const handleSave = () => {
    onSave({
      name,
      defaultMinutes: useTaskEstimates ? calculateBlockEstimateFromTasks(template.tasks) : defaultMinutes,
      category,
      isHidden,
      useTaskEstimates,
    });
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    addTaskToTemplate(template.id, {
      name: newTaskName.trim(),
      estimateMinutes: newTaskMinutes,
    });
    setNewTaskName('');
    setNewTaskMinutes(15);
  };

  const handleRemoveTask = (taskId: string) => {
    removeTaskFromTemplate(template.id, taskId);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<TaskTemplate>) => {
    updateTaskInTemplate(template.id, taskId, updates);
  };

  const taskSum = calculateBlockEstimateFromTasks(template.tasks);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card border-[hsl(var(--primary)/0.5)] p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Edit Template</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="action-button px-3 py-1.5 text-sm"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </motion.button>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">Category</label>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
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
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">
          Duration (minutes)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={useTaskEstimates ? taskSum : defaultMinutes}
            onChange={(e) => setDefaultMinutes(parseInt(e.target.value) || 0)}
            disabled={useTaskEstimates}
            min="0"
            step="15"
            className={`w-24 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] ${
              useTaskEstimates ? 'opacity-50' : ''
            }`}
          />
          {template.tasks.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useTaskEstimates}
                onChange={(e) => setUseTaskEstimates(e.target.checked)}
                className="rounded accent-[hsl(var(--primary))]"
              />
              <span className="text-[hsl(var(--muted-foreground))]">
                Use task sum ({taskSum}m)
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Hidden toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="rounded accent-[hsl(var(--primary))]"
          />
          <span className="text-sm">Hide from daily timeline</span>
        </label>
      </div>

      {/* Tasks */}
      <div className="border-t border-[hsl(var(--border))] pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">Tasks</h4>

        {template.tasks.length > 0 && (
          <div className="space-y-2 mb-4">
            {template.tasks
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 bg-[hsl(var(--input))] rounded-lg p-2"
                >
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleUpdateTask(task.id, { name: e.target.value })}
                    className="flex-1 bg-transparent border-none px-2 py-1 text-sm focus:outline-none"
                    placeholder="Task name"
                  />
                  <input
                    type="number"
                    value={task.estimateMinutes || 0}
                    onChange={(e) =>
                      handleUpdateTask(task.id, {
                        estimateMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="5"
                    className="w-16 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                  />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">m</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveTask(task.id)}
                    className="action-button p-1 hover:text-[hsl(var(--destructive))]"
                    aria-label="Remove task"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              ))}
          </div>
        )}

        {/* Add task form */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task..."
            className="flex-1 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          />
          <input
            type="number"
            value={newTaskMinutes}
            onChange={(e) => setNewTaskMinutes(parseInt(e.target.value) || 0)}
            min="0"
            step="5"
            className="w-16 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
          />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">m</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            disabled={!newTaskName.trim()}
            className="p-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            aria-label="Add task"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>

      {/* Delete button */}
      {!template.isDefault && (
        <div className="border-t border-[hsl(var(--border))] pt-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDelete}
            className="text-sm text-[hsl(var(--destructive))] hover:underline"
          >
            Delete this template
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

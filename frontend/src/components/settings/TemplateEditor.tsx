import { useState } from 'react';
import { useTemplateStore } from '@/store/templateStore';
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

  const categoryOptions: { value: BlockCategory; label: string; color: string }[] = [
    { value: 'work', label: 'Work', color: 'bg-blue-500' },
    { value: 'routine', label: 'Routine', color: 'bg-gray-500' },
    { value: 'movement', label: 'Movement', color: 'bg-green-500' },
    { value: 'leisure', label: 'Leisure', color: 'bg-purple-500' },
  ];

  const taskSum = calculateBlockEstimateFromTasks(template.tasks);

  return (
    <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Edit Template</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm text-[var(--color-text-muted)] mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm text-[var(--color-text-muted)] mb-1">Category</label>
        <div className="flex gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                category === opt.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${opt.color}`} />
              <span className="text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label className="block text-sm text-[var(--color-text-muted)] mb-1">
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
            className={`w-24 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 ${
              useTaskEstimates ? 'opacity-50' : ''
            }`}
          />
          {template.tasks.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useTaskEstimates}
                onChange={(e) => setUseTaskEstimates(e.target.checked)}
                className="rounded"
              />
              <span className="text-[var(--color-text-muted)]">
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
            className="rounded"
          />
          <span className="text-sm">Hide from daily timeline</span>
        </label>
      </div>

      {/* Tasks */}
      <div className="border-t border-[var(--color-border)] pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">Tasks</h4>

        {template.tasks.length > 0 && (
          <div className="space-y-2 mb-4">
            {template.tasks
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 bg-[var(--color-bg)] rounded-lg p-2"
                >
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleUpdateTask(task.id, { name: e.target.value })}
                    className="flex-1 bg-transparent border-none px-2 py-1 text-sm"
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
                    className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 text-sm text-center"
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">m</span>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                    aria-label="Remove task"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
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
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={newTaskMinutes}
            onChange={(e) => setNewTaskMinutes(parseInt(e.target.value) || 0)}
            min="0"
            step="5"
            className="w-16 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm text-center"
          />
          <span className="text-xs text-[var(--color-text-muted)]">m</span>
          <button
            onClick={handleAddTask}
            disabled={!newTaskName.trim()}
            className="p-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            aria-label="Add task"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete button */}
      {!template.isDefault && (
        <div className="border-t border-[var(--color-border)] pt-4 mt-4">
          <button
            onClick={onDelete}
            className="text-sm text-[var(--color-error)] hover:underline"
          >
            Delete this template
          </button>
        </div>
      )}
    </div>
  );
}

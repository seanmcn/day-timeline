import { useState } from 'react';
import { type Task } from '@day-timeline/shared';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  blockId: string;
  onToggleTask: (taskId: string) => void;
}

export function TaskList({ tasks, blockId: _blockId, onToggleTask }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = completedCount === totalCount;

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      {/* Header with toggle and progress */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        >
          <path d="M4 2l4 4-4 4V2z" />
        </svg>

        <span className="text-sm font-medium">Tasks</span>

        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            allCompleted
              ? 'bg-green-500/20 text-green-400'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
          }`}
        >
          {completedCount}/{totalCount}
        </span>
      </button>

      {/* Task list */}
      {isExpanded && (
        <div className="mt-2 pl-5">
          {tasks
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

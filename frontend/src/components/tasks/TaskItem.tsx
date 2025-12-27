import { type Task } from '@day-timeline/shared';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-5 h-5 rounded border border-[var(--color-border)]
                   flex items-center justify-center transition-colors
                   hover:border-[var(--color-accent)]"
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          task.completed ? 'line-through text-[var(--color-text-muted)]' : ''
        }`}
      >
        {task.name}
      </span>

      {task.estimateMinutes !== undefined && task.estimateMinutes > 0 && (
        <span className="text-xs text-[var(--color-text-muted)]">
          {task.estimateMinutes}m
        </span>
      )}
    </div>
  );
}

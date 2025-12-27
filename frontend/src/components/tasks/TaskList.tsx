import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { type Task } from '@day-timeline/shared';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  blockId: string;
  onToggleTask: (taskId: string) => void;
}

export function TaskList({ tasks, blockId: _blockId, onToggleTask }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = completedCount === totalCount;

  return (
    <div className="mt-2 border-t border-[hsl(var(--border)/0.5)] pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} />
        </motion.div>
        <span className="font-medium">Tasks</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            allCompleted
              ? 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]'
              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
          }`}
        >
          {completedCount}/{totalCount}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 space-y-0.5"
          >
            {tasks
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

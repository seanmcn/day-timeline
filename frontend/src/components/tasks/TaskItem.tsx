import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { type Task } from '@day-timeline/shared';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="subtask-item group py-1.5 px-2"
      onClick={onToggle}
    >
      <div
        className={`subtask-checkbox w-4 h-4 ${task.completed ? 'checked' : ''}`}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Check size={10} className="text-[hsl(var(--primary-foreground))]" />
          </motion.div>
        )}
      </div>
      <span
        className={`flex-1 text-xs ${
          task.completed
            ? 'line-through text-[hsl(var(--muted-foreground))]'
            : ''
        }`}
      >
        {task.name}
      </span>
      {task.estimateMinutes !== undefined && task.estimateMinutes > 0 && (
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {task.estimateMinutes}m
        </span>
      )}
    </motion.div>
  );
}

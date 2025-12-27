import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Clock } from 'lucide-react';
import { useDayStore } from '@/store/dayStore';

const MESSAGE_VARIATIONS = [
  { heading: "Ready to start your day?", button: "I'm awake" },
  { heading: "Rise and shine!", button: "Let's go" },
  { heading: "Good morning!", button: "Start my day" },
  { heading: "Time to seize the day!", button: "I'm ready" },
  { heading: "A new day awaits!", button: "Let's do this" },
  { heading: "Ready to be productive?", button: "Absolutely" },
  { heading: "What will you accomplish today?", button: "Let's find out" },
  { heading: "The day is yours!", button: "Claim it" },
  { heading: "Adventure awaits!", button: "Begin" },
  { heading: "Time to make things happen!", button: "On it" },
  { heading: "Ready to crush it?", button: "Born ready" },
  { heading: "Let's make today count!", button: "Count me in" },
  { heading: "Your day starts now!", button: "Let's roll" },
  { heading: "What's on the agenda?", button: "Show me" },
  { heading: "Time to get things done!", button: "Bring it on" },
  { heading: "Another day, another chance!", button: "Seize it" },
  { heading: "Ready for a great day?", button: "Always" },
  { heading: "The world awaits!", button: "Here I come" },
  { heading: "Today's going to be good!", button: "I agree" },
  { heading: "Coffee time is over!", button: "Fine, let's go" },
];

export function DayStartButton() {
  const { startDay } = useDayStore();

  const message = useMemo(() => {
    const index = Math.floor(Math.random() * MESSAGE_VARIATIONS.length);
    return MESSAGE_VARIATIONS[index];
  }, []);

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] lg:min-h-[40vh]"
    >
      <div className="glass-card p-8 md:p-12 text-center max-w-md w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[hsl(var(--primary)/0.15)] flex items-center justify-center"
        >
          <Sun size={32} className="text-[hsl(var(--primary))]" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-heading text-2xl font-semibold text-[hsl(var(--foreground))] mb-2"
        >
          {message.heading}
        </motion.h2>

        {/* Current time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] mb-8"
        >
          <Clock size={14} />
          <span className="text-sm">Current time: {timeString}</span>
        </motion.div>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startDay()}
          className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary-foreground))] font-semibold text-lg px-8 py-4 rounded-xl transition-colors glow-primary"
        >
          {message.button}
        </motion.button>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-[hsl(var(--muted-foreground))] mt-4"
        >
          You can adjust the start time after
        </motion.p>
      </div>
    </motion.div>
  );
}

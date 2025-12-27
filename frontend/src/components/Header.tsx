import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { useDayStore } from '@/store/dayStore';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const { isSaving } = useDayStore();
  const { user, logout } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-[hsl(var(--background)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.5)] px-4 py-3"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <h1 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
          Day Timeline
        </h1>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-[hsl(var(--muted-foreground))] animate-pulse">
              Saving...
            </span>
          )}

          <Link to="/settings">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="action-button p-1.5"
              title="Settings"
            >
              <Settings size={16} />
            </motion.div>
          </Link>

          <div className="flex items-center gap-2 pl-2 ml-2 border-l border-[hsl(var(--border))]">
            <span className="text-xs text-[hsl(var(--muted-foreground))] hidden md:inline truncate max-w-[120px]">
              {user?.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="action-button p-1.5"
              title="Sign out"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

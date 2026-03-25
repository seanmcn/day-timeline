import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { useGoogleStore } from '@/store/googleStore';
import { useCategoryStore } from '@/store/categoryStore';
import { initiateGoogleAuth } from '@/lib/google-auth';

export function GoogleIntegration() {
  const {
    isConnected,
    googleEmail,
    defaultCalendarCategory,
    defaultTaskCategory,
    isLoading,
    error,
    disconnect,
    updateSettings,
  } = useGoogleStore();

  const allCategories = useCategoryStore((state) => state.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => !c.isDeleted),
    [allCategories]
  );
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleDisconnect = async () => {
    await disconnect();
    setShowDisconnectConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))]">
        <Loader2 size={16} className="animate-spin" />
        Loading...
      </div>
    );
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-[hsl(var(--primary))]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[hsl(var(--foreground))]">
              Google Calendar & Tasks
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Import your calendar events as pinned blocks and Google Tasks as
              blocks when you start each day. All-day events are ignored.
            </p>
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => initiateGoogleAuth()}
              className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium"
            >
              Connect with Google
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      {/* Connected status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-medium text-[hsl(var(--foreground))]">
              Google Connected
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {googleEmail}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Category settings */}
      <div className="space-y-4 pt-2 border-t border-[hsl(var(--border)/0.5)]">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
            Category for calendar events
          </label>
          <select
            value={defaultCalendarCategory ?? ''}
            onChange={(e) =>
              updateSettings({
                defaultCalendarCategory: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
            Category for Google Tasks
          </label>
          <select
            value={defaultTaskCategory ?? ''}
            onChange={(e) =>
              updateSettings({
                defaultTaskCategory: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disconnect */}
      <div className="pt-2 border-t border-[hsl(var(--border)/0.5)]">
        {showDisconnectConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Disconnect Google?
            </span>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDisconnectConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-[hsl(var(--muted-foreground))] text-sm hover:text-[hsl(var(--foreground))] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Disconnect Google account
          </button>
        )}
      </div>
    </motion.div>
  );
}

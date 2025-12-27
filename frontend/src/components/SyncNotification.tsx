import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useDayStore } from '@/store/dayStore';

export function SyncNotification() {
  const remoteChangeAvailable = useDayStore((state) => state.remoteChangeAvailable);
  const refreshFromRemote = useDayStore((state) => state.refreshFromRemote);
  const dismissRemoteChange = useDayStore((state) => state.dismissRemoteChange);

  return createPortal(
    <AnimatePresence>
      {remoteChangeAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-3 flex items-center gap-3 shadow-lg"
        >
          <RefreshCw size={18} className="text-[hsl(var(--primary))]" />
          <span className="text-sm">Changes detected from another device</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshFromRemote}
            className="px-3 py-1.5 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium"
          >
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={dismissRemoteChange}
            className="action-button p-1"
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

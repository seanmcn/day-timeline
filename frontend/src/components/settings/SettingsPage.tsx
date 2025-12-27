import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { TemplateList } from './TemplateList';

export function SettingsPage() {
  const { isLoading, error } = useTemplateStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[hsl(var(--background)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.5)] px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/" aria-label="Back to timeline">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="action-button p-2 -ml-2"
            >
              <ArrowLeft size={20} />
            </motion.div>
          </Link>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Settings</h1>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            Loading templates...
          </div>
        ) : error ? (
          <div className="text-center text-[hsl(var(--destructive))]">{error}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <section>
              <h2 className="text-lg font-semibold mb-4">Block Templates</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Customize the blocks that appear when you start a new day. You can
                add tasks to any block, reorder them, or hide ones you don't use.
              </p>
              <TemplateList />
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
}

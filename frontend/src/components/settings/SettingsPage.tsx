import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid, Tag } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { useCategoryStore } from '@/store/categoryStore';
import { TemplateList } from './TemplateList';
import { CategoryList } from './CategoryList';

type SettingsTab = 'blocks' | 'categories';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('blocks');
  const { isLoading: templatesLoading, error: templatesError } = useTemplateStore();
  const categoriesLoading = useCategoryStore((state) => state.isLoading);
  const categoriesError = useCategoryStore((state) => state.error);

  useEffect(() => {
    useCategoryStore.getState().loadCategories();
  }, []);

  const isLoading = activeTab === 'blocks' ? templatesLoading : categoriesLoading;
  const error = activeTab === 'blocks' ? templatesError : categoriesError;

  const tabs = [
    { id: 'blocks' as const, label: 'Blocks', icon: LayoutGrid },
    { id: 'categories' as const, label: 'Categories', icon: Tag },
  ];

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
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'glass-card text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            Loading...
          </div>
        ) : error ? (
          <div className="text-center text-[hsl(var(--destructive))]">{error}</div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {activeTab === 'blocks' ? (
              <section>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  Customize the blocks that appear when you start a new day. You can
                  add tasks to any block, reorder them, or hide ones you don't use.
                </p>
                <TemplateList />
              </section>
            ) : (
              <section>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  Manage your categories to organize and color-code your blocks.
                  Deleted categories are preserved for historical blocks.
                </p>
                <CategoryList />
              </section>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

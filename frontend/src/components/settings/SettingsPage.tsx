import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid, Tag, Plug } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useMediaQuery, XL_BREAKPOINT } from '@/hooks/useMediaQuery';
import { SidePanel } from '@/components/SidePanel';
import { Dialog } from '@/components/ui/Dialog';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { CategoryList } from './CategoryList';
import { GoogleIntegration } from './GoogleIntegration';
import type { BlockTemplate } from '@day-timeline/shared';

type SettingsTab = 'blocks' | 'categories' | 'integrations';

const DELETE_COUNTDOWN_SECONDS = 5;

interface PendingDelete {
  templateId: string;
  startedAt: number;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('blocks');
  const { templates, isLoading: templatesLoading, error: templatesError, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
  const allCategories = useCategoryStore((state) => state.categories);
  const categoriesLoading = useCategoryStore((state) => state.isLoading);
  const categoriesError = useCategoryStore((state) => state.error);
  const isXl = useMediaQuery(XL_BREAKPOINT);

  // Template editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete countdown state
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [, forceUpdate] = useState({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    useCategoryStore.getState().loadCategories();
  }, []);

  const isLoading = activeTab === 'blocks' ? templatesLoading : activeTab === 'categories' ? categoriesLoading : false;
  const error = activeTab === 'blocks' ? templatesError : activeTab === 'categories' ? categoriesError : null;

  const editingTemplate = editingId ? templates.find((t) => t.id === editingId) ?? null : null;

  const categories = allCategories.filter((c) => !c.isDeleted).sort((a, b) => a.order - b.order);
  const defaultCategory = categories[0]?.id ?? 'routine';

  const handleAddTemplate = useCallback(() => {
    const id = addTemplate({
      name: 'New Block',
      defaultMinutes: 60,
      category: defaultCategory,
      tasks: [],
      useTaskEstimates: false,
      isDefault: false,
      isHidden: false,
    });
    setEditingId(id);
  }, [addTemplate, defaultCategory]);

  const handleSaveTemplate = useCallback((updates: Partial<BlockTemplate>) => {
    if (editingId) {
      updateTemplate(editingId, updates);
    }
  }, [editingId, updateTemplate]);

  const handleCloseEditor = useCallback(() => {
    setEditingId(null);
  }, []);

  // Delete with countdown
  const handleDeleteTemplate = useCallback(() => {
    if (!editingId) return;
    const templateId = editingId;
    setEditingId(null);
    setPendingDelete({ templateId, startedAt: Date.now() });
  }, [editingId]);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const getDeleteSecondsRemaining = useCallback((): number => {
    if (!pendingDelete) return 0;
    const elapsed = Math.floor((Date.now() - pendingDelete.startedAt) / 1000);
    return Math.max(0, DELETE_COUNTDOWN_SECONDS - elapsed);
  }, [pendingDelete]);

  // Countdown timer for pending delete
  useEffect(() => {
    if (!pendingDelete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pendingDelete.startedAt) / 1000);
      if (elapsed >= DELETE_COUNTDOWN_SECONDS) {
        deleteTemplate(pendingDelete.templateId);
        setPendingDelete(null);
      }
      forceUpdate({});
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingDelete, deleteTemplate]);

  const tabs = [
    { id: 'blocks' as const, label: 'Blocks', icon: LayoutGrid },
    { id: 'categories' as const, label: 'Categories', icon: Tag },
    { id: 'integrations' as const, label: 'Integrations', icon: Plug },
  ];

  const sidebarEditor = editingTemplate ? (
    <TemplateEditor
      key={editingTemplate.id}
      template={editingTemplate}
      onSave={handleSaveTemplate}
      onClose={handleCloseEditor}
      onDelete={handleDeleteTemplate}
      live
    />
  ) : null;

  const modalEditor = editingTemplate ? (
    <TemplateEditor
      key={editingTemplate.id}
      template={editingTemplate}
      onSave={handleSaveTemplate}
      onClose={handleCloseEditor}
      onDelete={handleDeleteTemplate}
    />
  ) : null;

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
                <TemplateList
                  editingId={editingId}
                  onEditTemplate={setEditingId}
                  onAddTemplate={handleAddTemplate}
                  pendingDeleteId={pendingDelete?.templateId ?? null}
                  deleteCountdownSeconds={getDeleteSecondsRemaining()}
                  onCancelDelete={cancelDelete}
                />
              </section>
            ) : activeTab === 'categories' ? (
              <section>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  Manage your categories to organize and color-code your blocks.
                  Deleted categories are preserved for historical blocks.
                </p>
                <CategoryList />
              </section>
            ) : (
              <section>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  Connect external services to automatically import events and tasks
                  into your daily timeline.
                </p>
                <GoogleIntegration />
              </section>
            )}
          </motion.div>
        )}
      </main>

      {/* Template editor - Side panel on xl+, Dialog on smaller screens */}
      {isXl ? (
        <SidePanel
          isOpen={editingTemplate !== null}
          onClose={handleCloseEditor}
          title="Edit Template"
        >
          {sidebarEditor}
        </SidePanel>
      ) : (
        <Dialog
          isOpen={editingTemplate !== null}
          onClose={handleCloseEditor}
          title="Edit Template"
        >
          {modalEditor}
        </Dialog>
      )}
    </div>
  );
}

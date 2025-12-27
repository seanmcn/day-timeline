import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { type Block, getTodayKey } from '@day-timeline/shared';
import { useDayStore } from '@/store/dayStore';
import { useTemplateStore } from '@/store/templateStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Header } from '@/components/Header';
import { DateNavigator } from '@/components/DateNavigator';
import { DayStartButton } from '@/components/DayStartButton';
import { BlockList } from '@/components/BlockList';
import { DayMetrics } from '@/components/DayMetrics';
import { AddBlockButton } from '@/components/AddBlockButton';
import { AddBlockModal, EditBlockModal } from '@/components/modals';
import { SettingsPage } from '@/components/settings/SettingsPage';

export default function App() {
  return (
    <Authenticator>
      {({ user }) => <AuthenticatedApp userId={user?.userId ?? ''} />}
    </Authenticator>
  );
}

function AuthenticatedApp({ userId }: { userId: string }) {
  const { dayState, isLoading, error, loadDay, addBlock, updateBlock } = useDayStore();
  const { loadTemplates } = useTemplateStore();
  const [currentDate, setCurrentDate] = useState(getTodayKey());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  useEffect(() => {
    if (userId) {
      loadDay(currentDate);
    }
  }, [userId, currentDate, loadDay]);

  // Load templates and categories once on startup
  useEffect(() => {
    if (userId) {
      loadTemplates();
      useCategoryStore.getState().loadCategories();
    }
  }, [userId, loadTemplates]);

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleAddBlock = (blockData: Parameters<typeof addBlock>[0]) => {
    addBlock(blockData);
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
  };

  const handleSaveBlock = (blockId: string, updates: Partial<Block>) => {
    updateBlock(blockId, updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[hsl(var(--muted-foreground))]"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-[hsl(var(--destructive))]">{error}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] via-transparent to-[hsl(var(--accent)/0.05)] pointer-events-none" />

        <div className="relative">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
                    {/* Two-column layout on desktop */}
                    <div className="lg:flex lg:gap-6 lg:justify-center">
                      {/* Sidebar - date & metrics */}
                      <div className="lg:w-80 lg:flex-shrink-0">
                        <DateNavigator
                          currentDate={currentDate}
                          onDateChange={handleDateChange}
                        />
                        {dayState?.dayStartAt && <DayMetrics />}
                      </div>

                      {/* Main content - blocks */}
                      <div className="flex-1 lg:max-w-2xl">
                        {!dayState?.dayStartAt ? (
                          <DayStartButton />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                          >
                            <BlockList onEditBlock={handleEditBlock} />
                            <AddBlockButton onClick={() => setIsAddModalOpen(true)} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </main>
                </>
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>

        {/* Modals */}
        <AddBlockModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddBlock}
        />

        <EditBlockModal
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={handleSaveBlock}
        />
      </div>
    </BrowserRouter>
  );
}

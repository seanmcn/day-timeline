import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, RotateCcw } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { CategoryEditor } from './CategoryEditor';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@day-timeline/shared';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

export function CategoryList() {
  const categories = useCategoryStore((state) => state.categories);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );
  const activeCategories = useMemo(
    () => sortedCategories.filter((c) => !c.isDeleted),
    [sortedCategories]
  );
  const deletedCategories = useMemo(
    () => sortedCategories.filter((c) => c.isDeleted),
    [sortedCategories]
  );

  const handleAdd = () => {
    // Pick a color that's not already used
    const usedColors = categories.map((c) => c.color);
    const availableColor = CATEGORY_COLORS.find((c) => !usedColors.includes(c.value))?.value
      ?? CATEGORY_COLORS[0].value;
    // Pick an icon that's not already used
    const usedIcons = categories.map((c) => c.icon).filter(Boolean);
    const availableIcon = CATEGORY_ICONS.find((i) => !usedIcons.includes(i))
      ?? CATEGORY_ICONS[0];
    useCategoryStore.getState().addCategory('New Category', availableColor, availableIcon);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {activeCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: index * 0.03 }}
            layout
          >
            {editingId === category.id ? (
              <CategoryEditor
                category={category}
                onSave={(updates) => {
                  useCategoryStore.getState().updateCategory(category.id, updates);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                onDelete={() => {
                  useCategoryStore.getState().deleteCategory(category.id);
                  setEditingId(null);
                }}
              />
            ) : (
              <div className="glass-card-hover relative overflow-hidden">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="w-full p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${category.color} / 0.2)` }}
                      >
                        <DynamicIcon
                          name={category.icon ?? 'circle'}
                          size={16}
                          style={{ color: `hsl(${category.color})` }}
                        />
                      </div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <ChevronRight size={16} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add new category button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAdd}
        className="w-full glass-card border-dashed border-2 border-[hsl(var(--border))]
                   text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]
                   hover:border-[hsl(var(--primary)/0.5)] transition-all
                   flex items-center justify-center gap-2 p-4"
      >
        <Plus size={16} />
        Add Category
      </motion.button>

      {/* Deleted categories section */}
      {deletedCategories.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
            Archived Categories
          </h3>
          <div className="space-y-2">
            {deletedCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="glass-card p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center opacity-50"
                    style={{ backgroundColor: `hsl(${category.color} / 0.2)` }}
                  >
                    <DynamicIcon
                      name={category.icon ?? 'circle'}
                      size={12}
                      style={{ color: `hsl(${category.color})` }}
                    />
                  </div>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {category.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => useCategoryStore.getState().restoreCategory(category.id)}
                  className="action-button p-1.5"
                  title="Restore category"
                >
                  <RotateCcw size={14} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { TemplateEditor } from './TemplateEditor';
import type { BlockTemplate, BlockCategory } from '@day-timeline/shared';

export function TemplateList() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedTemplates = [...templates].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    const newTemplate: Omit<BlockTemplate, 'id' | 'order'> = {
      name: 'New Block',
      defaultMinutes: 60,
      category: 'routine' as BlockCategory,
      tasks: [],
      useTaskEstimates: false,
      isDefault: false,
      isHidden: false,
    };
    addTemplate(newTemplate);
  };

  const categoryColors: Record<BlockCategory, string> = {
    work: 'hsl(var(--primary))',
    movement: 'hsl(var(--success))',
    leisure: 'hsl(var(--warning))',
    routine: 'hsl(var(--accent))',
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {sortedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: index * 0.03 }}
            layout
          >
            {editingId === template.id ? (
              <TemplateEditor
                template={template}
                onSave={(updates) => {
                  updateTemplate(template.id, updates);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                onDelete={() => {
                  deleteTemplate(template.id);
                  setEditingId(null);
                }}
              />
            ) : (
              <div
                className={`glass-card-hover relative overflow-hidden ${template.isHidden ? 'opacity-50' : ''}`}
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: categoryColors[template.category],
                }}
              >
                <button
                  onClick={() => setEditingId(template.id)}
                  className="w-full p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                          {template.defaultMinutes}m
                        </span>
                        {template.tasks.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                            {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {template.isHidden && (
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            (hidden)
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add new template button */}
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
        Add Block Template
      </motion.button>
    </div>
  );
}

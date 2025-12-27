import { useState } from 'react';
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
    work: 'border-l-blue-500',
    movement: 'border-l-green-500',
    leisure: 'border-l-purple-500',
    routine: 'border-l-gray-500',
  };

  return (
    <div className="space-y-3">
      {sortedTemplates.map((template) => (
        <div key={template.id}>
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
              className={`rounded-xl border border-[var(--color-border)] ${
                categoryColors[template.category]
              } border-l-4 ${template.isHidden ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => setEditingId(template.id)}
                className="w-full p-4 text-left hover:bg-[var(--color-surface)] transition-colors rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {template.defaultMinutes}m
                      </span>
                      {template.tasks.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                          {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {template.isHidden && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          (hidden)
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[var(--color-text-muted)]"
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add new template button */}
      <button
        onClick={handleAdd}
        className="w-full p-4 rounded-xl border border-dashed border-[var(--color-border)]
                   text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                   hover:border-[var(--color-accent)] transition-colors
                   flex items-center justify-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add Block Template
      </button>
    </div>
  );
}

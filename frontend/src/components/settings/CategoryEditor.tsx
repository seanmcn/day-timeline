import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Category } from '@day-timeline/shared';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@day-timeline/shared';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface CategoryEditorProps {
  category: Category;
  onSave: (updates: Partial<Category>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function CategoryEditor({ category, onSave, onCancel, onDelete }: CategoryEditorProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [icon, setIcon] = useState(category.icon ?? 'circle');

  const handleSave = () => {
    onSave({ name, color, icon });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card border-[hsl(var(--primary)/0.5)] p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Edit Category</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="action-button px-3 py-1.5 text-sm"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </motion.button>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {/* Color Picker */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">Color</label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_COLORS.map((colorOption) => (
            <motion.button
              key={colorOption.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setColor(colorOption.value)}
              className={`relative h-10 rounded-lg transition-all ${
                color === colorOption.value
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--background))]'
                  : ''
              }`}
              style={{ backgroundColor: `hsl(${colorOption.value})` }}
              title={colorOption.name}
            >
              {color === colorOption.value && (
                <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-md" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">Icon</label>
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_ICONS.map((iconName) => (
            <motion.button
              key={iconName}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIcon(iconName)}
              className={`relative h-10 rounded-lg transition-all flex items-center justify-center ${
                icon === iconName
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
              title={iconName}
            >
              <DynamicIcon name={iconName} size={18} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">Preview</label>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--input))]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `hsl(${color} / 0.2)` }}
          >
            <DynamicIcon name={icon} size={16} style={{ color: `hsl(${color})` }} />
          </div>
          <span className="font-medium">{name || 'Category Name'}</span>
        </div>
      </div>

      {/* Delete button */}
      <div className="border-t border-[hsl(var(--border))] pt-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDelete}
          className="text-sm text-[hsl(var(--destructive))] hover:underline"
        >
          Archive this category
        </motion.button>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Archived categories are preserved for historical blocks but hidden from new block creation.
        </p>
      </div>
    </motion.div>
  );
}

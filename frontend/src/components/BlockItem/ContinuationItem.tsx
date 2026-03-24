import { useCategoryStore } from '@/store/categoryStore';
import { formatTime, formatDuration } from '@/lib/time';
import type { TimelineSegment } from '@/lib/timeline';

interface ContinuationItemProps {
  segment: TimelineSegment;
}

export function ContinuationItem({ segment }: ContinuationItemProps) {
  const allCategories = useCategoryStore((state) => state.categories);
  const category = allCategories.find((c) => c.id === segment.block.category);
  const categoryColor = category?.color ?? '210 15% 50%';

  return (
    <div
      className="timeline-block glass-card p-4 opacity-60"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: `hsl(${categoryColor})`,
        borderLeftStyle: 'dashed',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-heading font-semibold text-base text-[hsl(var(--muted-foreground))]">
            {segment.displayLabel}
          </h3>
        </div>
        <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {formatTime(segment.projectedStart)}
        </div>
        <div className="flex items-center gap-4 text-sm font-mono mt-3 pt-3 border-t border-[hsl(var(--border)/0.3)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[hsl(var(--muted-foreground))] font-sans">Est:</span>
            <span>{formatDuration(segment.effectiveEstimate, false)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

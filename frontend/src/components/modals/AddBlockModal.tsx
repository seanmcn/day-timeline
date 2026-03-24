import { type BlockCategory } from '@day-timeline/shared';
import { Dialog } from '@/components/ui/Dialog';
import { AddBlockForm } from '@/components/forms';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (block: {
    label: string;
    category: BlockCategory;
    estimateMinutes: number;
    tasks: { id: string; name: string; estimateMinutes?: number; completed: boolean; order: number }[];
    notes: string;
    useTaskEstimates: boolean;
    scheduledAt?: string;
  }) => void;
}

export function AddBlockModal({ isOpen, onClose, onAdd }: AddBlockModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Block">
      <AddBlockForm onAdd={onAdd} onClose={onClose} />
    </Dialog>
  );
}

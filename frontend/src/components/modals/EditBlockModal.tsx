import { type Block } from '@day-timeline/shared';
import { Dialog } from '@/components/ui/Dialog';
import { EditBlockForm } from '@/components/forms';

interface EditBlockModalProps {
  block: Block | null;
  onClose: () => void;
  onSave: (blockId: string, updates: Partial<Block>) => void;
}

export function EditBlockModal({ block, onClose, onSave }: EditBlockModalProps) {
  if (!block) return null;

  return (
    <Dialog isOpen={!!block} onClose={onClose} title="Edit Block">
      <EditBlockForm block={block} onSave={onSave} onClose={onClose} />
    </Dialog>
  );
}

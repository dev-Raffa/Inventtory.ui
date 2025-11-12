import { Button } from '@/app/components/ui/button';
import { useFilePickerContext } from '../../../hooks';
import type { FileWithPreview } from '../../../types';
import { XIcon } from 'lucide-react';

export function FilePickerRemoveFileButton({
  id
}: Pick<FileWithPreview, 'id'>) {
  const [, { removeFile }] = useFilePickerContext();

  return (
    <Button
      onClick={() => removeFile(id)}
      size="icon"
      className="text-primary-foreground hover:text-primary size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
      aria-label="Remove image"
    >
      <XIcon className="size-3.5" />
    </Button>
  );
}

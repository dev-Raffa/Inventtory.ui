import type { ReactNode, DragEvent } from 'react';
import { useCallback } from 'react';
import { useFilePickerContext } from '../../hooks';
import { useDropzone } from '@/app/hooks/use-dropzone';

export function FilePickerDrag({ children }: { children?: ReactNode }) {
  const [{ files }, { addFiles }] = useFilePickerContext();

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const { isDragging, dropzoneProps } = useDropzone({
    onDrop: handleDrop
  });

  return (
    <div
      {...dropzoneProps}
      data-dragging={isDragging || undefined}
      data-files={files.length > 0 || undefined}
      className="relative flex min-h-56 flex-col items-center overflow-hidden rounded-xl border-2 border-muted-foreground/50 border-dashed  p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
    >
      {children}
    </div>
  );
}

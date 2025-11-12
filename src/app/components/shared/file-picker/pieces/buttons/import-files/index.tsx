import { Button } from '@/app/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { useFilePickerContext } from '../../../hooks';

export function FilePickerButton({ label }: { label: string }) {
  const [, { openFileDialog }] = useFilePickerContext();

  return (
    <Button
      type="button"
      variant="outline"
      className="mt-4"
      onClick={openFileDialog}
    >
      <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
      {label}
    </Button>
  );
}

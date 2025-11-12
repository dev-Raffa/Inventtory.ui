import { Button } from '@/app/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { useFilePickerContext } from '../../../hooks';

export function FilePickerAddMoreButton({ label }: { label: string }) {
  const [, { openFileDialog }] = useFilePickerContext();

  return (
    <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
      <UploadIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
      {label}
    </Button>
  );
}

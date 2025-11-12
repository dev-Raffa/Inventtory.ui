import { Button } from '@/app/components/ui/button';
import { useFilePickerContext } from '../../../hooks';
import { Trash2Icon } from 'lucide-react';

export function FilePickerRemoveAllButton({ label }: { label: string }) {
  const [, { clearFiles }] = useFilePickerContext();

  return (
    <Button type="button" variant="outline" size="sm" onClick={clearFiles}>
      <Trash2Icon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
      {label}
    </Button>
  );
}

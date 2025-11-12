import { AlertCircleIcon } from 'lucide-react';
import { useFilePickerContext } from '../../hooks';

export function FilePickerError() {
  const [{ errors }] = useFilePickerContext();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1" role="alert">
      {errors.map((error, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircleIcon className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}

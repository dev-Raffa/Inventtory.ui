import type { ReactNode } from 'react';
import { useFilePickerContext } from '../../hooks';

export function FilePickerHeader({ children }: { children: ReactNode }) {
  const [{ files }] = useFilePickerContext();
  return (
    files.length > 0 && (
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        {children}
      </div>
    )
  );
}

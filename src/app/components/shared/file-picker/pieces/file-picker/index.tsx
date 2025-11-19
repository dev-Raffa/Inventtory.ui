import type { ReactNode } from 'react';
import { useFilePicker } from '../../hooks/use-file-picker';
import { FilePickerContext } from '../../hooks';
import type { FilePickerOptions, FileWithPreview } from '../../types';

type TFilePicker = Omit<
  FilePickerOptions,
  'maxSize' | 'files' | 'onFilesChange'
> & {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  maxSizeMB?: number;
  children?: ReactNode;
};

export function FilePicker({
  children,
  maxSizeMB = 5,
  files,
  onFilesChange,
  ...options
}: TFilePicker) {
  const filePickerOptions: FilePickerOptions = {
    ...options,
    files,
    onFilesChange,
    maxFiles: options.maxFiles ? options.maxFiles : 5,
    multiple: options.multiple || true,
    maxSize: maxSizeMB * 1024 * 1024
  };

  const [state, actions] = useFilePicker(filePickerOptions);

  const contextValue: [typeof state & { files: typeof files }, typeof actions] =
    [{ ...state, files }, actions];

  return (
    <FilePickerContext.Provider value={contextValue}>
      <div className="flex flex-col gap-2">{children}</div>
    </FilePickerContext.Provider>
  );
}

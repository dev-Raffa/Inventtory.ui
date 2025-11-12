//import { useFilePicker } from '@/app/components/shared/file-upload/hook/use-file-picker'; // MUDANÇA
import { createContext, useContext } from 'react';
import type {
  FilePickerActions,
  FilePickerState,
  FileWithPreview
} from '../types';

type FilePickerContextType = [
  state: FilePickerState & { files: FileWithPreview[] },
  actions: FilePickerActions
];

export const FilePickerContext = createContext<FilePickerContextType | null>( // MUDANÇA
  null
);

export function useFilePickerContext() {
  const context = useContext(FilePickerContext);

  if (!context) {
    throw new Error(
      'useFilePickerContext deve ser usado dentro de <FilePickerProvider>' // MUDANÇA
    );
  }

  return context;
}

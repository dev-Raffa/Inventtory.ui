import { ImageIcon } from 'lucide-react';
import { FormField, FormMessage } from '@/app/components/ui/form';
import {
  FilePicker,
  FilePickerAddMoreButton,
  FilePickerButton,
  FilePickerContent,
  FilePickerCount,
  FilePickerDrag,
  FilePickerEmpty,
  FilePickerError,
  FilePickerHeader,
  FilePickerInput,
  FilePickerRemoveAllButton
} from '@/app/components/shared/file-picker/exports';

import { useProductForm } from '../../hook';

export function ProductFormFieldImages() {
  const { form } = useProductForm();
  const maxFiles = 10;
  const maxSizeMB = 5;

  return (
    <FormField
      control={form.control}
      name={'allImages'}
      render={({ field }) => (
        <FilePicker
          files={field.value || []}
          onFilesChange={field.onChange}
          maxFiles={maxFiles}
          maxSizeMB={maxSizeMB}
          accept="image/png,image/jpeg,image/jpg"
        >
          <FilePickerInput />
          <FilePickerDrag>
            <FilePickerHeader>
              <div className="w-full flex items-center justify-between gap-2 mb-3">
                <div>
                  <FilePickerCount label="Imagens" />
                </div>
                <div className="flex gap-2">
                  <FilePickerAddMoreButton label="Adcionar imagens" />
                  <FilePickerRemoveAllButton label="Remover todas" />
                </div>
              </div>
            </FilePickerHeader>
            <FilePickerEmpty>
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Solte a imagem dos produtos aqui
              </p>
              <p className="text-xs text-muted-foreground">
                Máximo de imagens {maxFiles} ∙ Até {maxSizeMB}MB
              </p>
              <FilePickerButton label="Selecionar imagens" />
            </FilePickerEmpty>
            <FilePickerContent className="md:grid-cols-5" />
            <FilePickerError />
          </FilePickerDrag>
          <FormMessage />
        </FilePicker>
      )}
    />
  );
}

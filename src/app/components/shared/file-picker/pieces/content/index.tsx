import type { ComponentProps } from 'react';
import { useFilePickerContext } from '../../hooks';
import { getFilePreview } from '../../utils';
import { cn } from '@/lib/utils';
import { FilePickerRemoveFileButton } from '../buttons/remove-file';
import { createCloudinaryThumbnail } from '@/app/services/image-upload/utils';
import { Star } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function FilePickerContent({
  className,
  ...props
}: ComponentProps<'div'>) {
  const [{ files }, { setPrimaryFile }] = useFilePickerContext();

  return (
    <div
      className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', className)}
      {...props}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className="relative flex flex-col rounded-md border bg-background overflow-hidden"
        >
          {
            //@ts-expect-error file
            !file.src && getFilePreview(file)
          }
          <img
            src={
              file.publicId && !file.publicId.startsWith('mock')
                ? createCloudinaryThumbnail(file.publicId, {
                    width: 450,
                    height: 450,
                    quality: 100
                  })
                : file.src
            }
            alt={file.name}
            className="size-full rounded-t-[inherit] object-cover"
          />
          <div className="absolute top-0 right-0 flex gap-1">
            {file.isPrimary && (
              <div className="bg-black/50 size-6 rounded-full border-2 border-background flex items-center justify-center">
                <Star className="size-3.5 text-yellow-400 fill-yellow-400" />
              </div>
            )}
            {!file.isPrimary && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 bg-black/50 rounded-full text-white hover:text-yellow-400"
                onClick={(e) => {
                  e.preventDefault();
                  setPrimaryFile(file.id);
                }}
                aria-label="Definir como principal"
              >
                <Star className="size-3.5" />
              </Button>
            )}

            <FilePickerRemoveFileButton id={file.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

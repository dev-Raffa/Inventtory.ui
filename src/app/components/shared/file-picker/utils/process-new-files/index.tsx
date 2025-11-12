import type { FileWithPreview } from '../../types';
import { generateUniqueId } from '../generate-unique-id';
import { validateFile } from '../validate-file';

export function processNewFiles(
  newFilesArray: File[],
  existingFiles: FileWithPreview[],
  options: {
    maxSize: number;
    accept: string;
    multiple: boolean;
  }
): { validFiles: FileWithPreview[]; errors: string[] } {
  const errors: string[] = [];
  const validFiles: FileWithPreview[] = [];

  newFilesArray.forEach((file) => {
    if (options.multiple) {
      const isDuplicate = existingFiles.some(
        (existingFile) =>
          existingFile.file instanceof File &&
          existingFile.file.name === file.name &&
          existingFile.file.size === file.size &&
          existingFile.file.lastModified === file.lastModified
      );
      if (isDuplicate) {
        return;
      }
    }

    const error = validateFile(file, options.maxSize, options.accept);

    if (error) {
      errors.push(error);
    } else {
      validFiles.push({
        file,
        id: generateUniqueId(file),
        src: URL.createObjectURL(file),
        publicId: generateUniqueId(file),
        isPrimary: false,
        name: file.name,
        type: file.type
      });
    }
  });

  return { validFiles, errors };
}

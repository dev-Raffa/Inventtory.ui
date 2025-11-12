import type { FileMetadata } from '../../types';

export function generateUniqueId(file: File | FileMetadata): string {
  if (file instanceof File) {
    return `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).substring(2, 9)}`;
  }

  return file.id;
}

import { formatBytes } from '@/lib/utils';
export function validateFile(
  file: File,
  maxSize: number,
  accept: string
): string | null {
  if (file.size > maxSize) {
    return `O arquivo "${file.name}" excede o tamanho máximo de ${formatBytes(maxSize)}.`;
  }

  if (accept !== '*') {
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const fileType = file.type || '';
    const fileExtension = `.${file.name.split('.').pop() || ''}`;

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileExtension.toLowerCase() === type.toLowerCase();
      }
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(`${baseType}/`);
      }
      return fileType === type;
    });

    if (!isAccepted) {
      return `O arquivo "${file.name}" não tem um formato aceito.`;
    }
  }

  return null;
}

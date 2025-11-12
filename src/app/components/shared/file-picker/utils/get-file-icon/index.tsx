import {
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon
} from 'lucide-react';

const iconMap = {
  pdf: {
    icon: FileTextIcon,
    conditions: (type: string, name: string) =>
      type.includes('pdf') ||
      name.endsWith('.pdf') ||
      type.includes('word') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
  },
  archive: {
    icon: FileArchiveIcon,
    conditions: (type: string, name: string) =>
      type.includes('zip') ||
      type.includes('archive') ||
      name.endsWith('.zip') ||
      name.endsWith('.rar')
  },
  excel: {
    icon: FileSpreadsheetIcon,
    conditions: (type: string, name: string) =>
      type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')
  },
  video: {
    icon: VideoIcon,
    conditions: (type: string) => type.includes('video/')
  },
  audio: {
    icon: HeadphonesIcon,
    conditions: (type: string) => type.includes('audio/')
  },
  image: {
    icon: ImageIcon,
    conditions: (type: string) => type.startsWith('image/')
  }
};

export function getFileIcon(file: {
  file: File | { type: string; name: string };
}) {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (!fileType) return;

  for (const { icon: Icon, conditions } of Object.values(iconMap)) {
    if (conditions(fileType, fileName)) {
      return <Icon className="size-5 opacity-60" />;
    }
  }

  return <FileIcon className="size-5 opacity-60" />;
}

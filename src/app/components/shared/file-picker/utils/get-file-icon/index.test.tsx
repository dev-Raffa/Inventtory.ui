import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getFileIcon } from './';
import {
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
  FileIcon
} from 'lucide-react';

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    FileArchiveIcon: vi.fn(),
    FileSpreadsheetIcon: vi.fn(),
    FileTextIcon: vi.fn(),
    HeadphonesIcon: vi.fn(),
    ImageIcon: vi.fn(),
    VideoIcon: vi.fn(),
    FileIcon: vi.fn()
  };
});

const createFileInput = (
  type: string,
  name: string,
  isFileInstance: boolean = false
) => {
  const fileData = { type, name } as { type: string; name: string };
  if (isFileInstance) {
    const file = new File([], name, { type });

    return { file };
  }
  return { file: fileData };
};

describe('getFileIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the correct icon for image formats', () => {
    const result = getFileIcon(createFileInput('image/jpeg', 'photo.jpg'));

    expect(result?.type).toBe(ImageIcon);
  });

  it('should return the correct icon for video formats', () => {
    const result = getFileIcon(createFileInput('video/mp4', 'clip.mp4'));

    expect(result?.type).toBe(VideoIcon);
  });

  it('should return the correct icon for audio formats', () => {
    const result = getFileIcon(createFileInput('audio/mpeg', 'song.mp3'));

    expect(result?.type).toBe(HeadphonesIcon);
  });

  it('The PDF icon should be restored for PDF files (by type) or DOCX files (by name)', () => {
    expect(
      getFileIcon(createFileInput('application/pdf', 'doc.pdf'))?.type
    ).toBe(FileTextIcon);

    expect(
      getFileIcon(createFileInput('application/octet-stream', 'report.docx'))
        ?.type
    ).toBe(FileTextIcon);

    expect(
      getFileIcon(createFileInput('application/msword', 'letter.doc'))?.type
    ).toBe(FileTextIcon);
  });

  it('The COMPRESSED FILE icon should revert to ZIP or RAR', () => {
    expect(
      getFileIcon(createFileInput('application/zip', 'archive.zip'))?.type
    ).toBe(FileArchiveIcon);

    expect(
      getFileIcon(createFileInput('application/octet-stream', 'files.rar'))
        ?.type
    ).toBe(FileArchiveIcon);
  });

  it('The Excel icon should be restored for spreadsheets', () => {
    expect(
      getFileIcon(createFileInput('application/vnd.ms-excel', 'data.xls'))?.type
    ).toBe(FileSpreadsheetIcon);

    expect(
      getFileIcon(createFileInput('application/octet-stream', 'data.xlsx'))
        ?.type
    ).toBe(FileSpreadsheetIcon);
  });

  it('should return the fallback icon (FileIcon) when the type is unknown', () => {
    const result = getFileIcon(
      createFileInput('application/json', 'config.json')
    );

    expect(result?.type).toBe(FileIcon);
  });

  it('should return undefined (guard clause) if fileType is false (e.g., null or empty)', () => {
    const result = getFileIcon(createFileInput('', 'no-type.bin'));

    expect(result).toBeUndefined();
  });

  it('must correctly process a File object (instanceof File)', () => {
    const result = getFileIcon(createFileInput('image/png', 'photo.png', true));

    expect(result?.type).toBe(ImageIcon);
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { validateFile } from './'; // Ajuste o caminho

const { mockFormatBytes } = vi.hoisted(() => {
  const mockFormatBytes = vi.fn((size) => `${size / 1024} KB`);

  return {
    mockFormatBytes
  };
});

vi.mock('@/lib/utils', () => ({ formatBytes: mockFormatBytes }));

const createMockFile = (name: string, size: number, type: string = '') =>
  ({
    name,
    size,
    type,
    lastModified: 0,
    slice: vi.fn()
  }) as unknown as File;

describe('validateFile', () => {
  const MAX_SIZE_BYTES = 500000; // 500 KB
  const FILE_NAME = 'test-file.pdf';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an error if the file size exceeds maxSize', () => {
    const largeFile = createMockFile(FILE_NAME, MAX_SIZE_BYTES + 1000); // 501 KB
    const error = validateFile(largeFile, MAX_SIZE_BYTES, '*');

    expect(error).toContain(`O arquivo "${FILE_NAME}" excede o tamanho máximo`);

    expect(mockFormatBytes).toHaveBeenCalledWith(MAX_SIZE_BYTES);
  });

  it('should return null if the file size is within the limit', () => {
    const smallFile = createMockFile(FILE_NAME, MAX_SIZE_BYTES - 100);
    const error = validateFile(smallFile, MAX_SIZE_BYTES, '*');

    expect(error).toBeNull();
  });

  it('It should return null if "accept" is "*" (Acceptance guard)', () => {
    const file = createMockFile(FILE_NAME, 100, 'application/whatever');
    const error = validateFile(file, MAX_SIZE_BYTES, '*');

    expect(error).toBeNull();
  });

  it('must successfully accept Wildcard type (image/*)', () => {
    const file = createMockFile('photo.jpeg', 100, 'image/jpeg');
    const error = validateFile(file, MAX_SIZE_BYTES, 'image/*,application/pdf');

    expect(error).toBeNull();
  });

  it('must successfully accept exact MIME type', () => {
    const file = createMockFile('doc.pdf', 100, 'application/pdf');
    const error = validateFile(file, MAX_SIZE_BYTES, 'image/*,application/pdf');

    expect(error).toBeNull();
  });

  it('should return an error indicating that the MIME type is not accepted', () => {
    const file = createMockFile('video.mp4', 100, 'video/mp4');
    const error = validateFile(file, MAX_SIZE_BYTES, 'image/*,application/pdf');

    expect(error).toContain('não tem um formato aceito.');
  });

  it('should successfully accept files with the extension (.pdf)', () => {
    const file = createMockFile('report.pdf', 100, 'application/octet-stream');
    const error = validateFile(file, MAX_SIZE_BYTES, '.pdf, .doc');

    expect(error).toBeNull();
  });

  it('should return an error if the extension is not accepted', () => {
    const file = createMockFile('image.jpg', 100, 'image/jpeg');
    const error = validateFile(file, MAX_SIZE_BYTES, '.pdf,.png');

    expect(error).toContain('não tem um formato aceito.');
  });

  it('should prioritize size failure if both (size and type) fail', () => {
    const largeFile = createMockFile(
      'bad.mp4',
      MAX_SIZE_BYTES + 1000,
      'video/mp4'
    );

    const error = validateFile(largeFile, MAX_SIZE_BYTES, 'image/png');

    expect(error).toContain('excede o tamanho máximo');
    expect(error).not.toContain('formato aceito');
  });
});

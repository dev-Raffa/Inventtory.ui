import { vi, describe, it, expect, beforeEach } from 'vitest';
import { processNewFiles } from './';
import type { FileWithPreview } from '../../types';

const { mockGenerateUniqueId, mockValidateFile } = vi.hoisted(() => {
  const mockGenerateUniqueId = vi.fn(() => 'unique-id-mock');
  const mockValidateFile = vi.fn();

  return {
    mockGenerateUniqueId,
    mockValidateFile
  };
});

vi.mock('../generate-unique-id', () => ({
  generateUniqueId: mockGenerateUniqueId
}));

vi.mock('../validate-file', () => ({
  validateFile: mockValidateFile
}));

//@ts-expect-error global is not defined
global.URL.createObjectURL = vi.fn((file) => `blob-url-mock-${file.name}`);

const existingFileInstance = new File(['data'], 'A.jpg', {
  lastModified: 1000
});

Object.defineProperty(existingFileInstance, 'size', {
  value: 100,
  writable: true
});

const mockFileA = {
  name: 'A.jpg',
  size: 100,
  lastModified: 1000,
  type: 'image/jpeg'
} as File;

const mockFileB = {
  name: 'B.png',
  size: 200,
  lastModified: 2000,
  type: 'image/png'
} as File;

const mockFileC = {
  name: 'A.jpg',
  size: 100,
  lastModified: 1000,
  type: 'image/jpeg'
} as File;

const existingFileA: FileWithPreview = {
  file: existingFileInstance,
  id: 'idA',
  src: 'blobA',
  name: 'A.jpg',
  type: 'image/jpeg',
  isPrimary: false
};

const defaultOptions = {
  maxSize: 500,
  accept: 'image/*',
  multiple: true
};

describe('processNewFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateFile.mockReturnValue(null);
  });

  it('must structure valid files with a unique ID and Blob URL', () => {
    const { validFiles, errors } = processNewFiles(
      [mockFileB],
      [],
      defaultOptions
    );

    expect(errors).toEqual([]);
    expect(validFiles).toHaveLength(1);
    expect(validFiles[0]).toEqual({
      file: mockFileB,
      id: 'unique-id-mock',
      src: 'blob-url-mock-B.png',
      publicId: undefined,
      isPrimary: false,
      name: mockFileB.name,
      type: mockFileB.type
    });

    expect(mockGenerateUniqueId).toHaveBeenCalledWith(mockFileB);
    //@ts-expect-error global is not defined
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFileB);
  });

  it('should ignore files that are exact duplicates in "multiple" mode', () => {
    const newFiles = [mockFileC];

    const { validFiles, errors } = processNewFiles(
      newFiles,
      [existingFileA],
      defaultOptions
    );

    expect(errors).toEqual([]);
    expect(validFiles).toEqual([]);

    expect(mockValidateFile).not.toHaveBeenCalled();
  });

  it('should add the error to the list and skip the file if the validation fails', () => {
    const VALIDATION_ERROR = 'Arquivo muito grande!';

    mockValidateFile.mockReturnValue(VALIDATION_ERROR);

    const { validFiles, errors } = processNewFiles(
      [mockFileB],
      [],
      defaultOptions
    );

    expect(errors).toEqual([VALIDATION_ERROR]);
    expect(validFiles).toEqual([]);

    //@ts-expect-error global is not defined
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('The file should be processed in "single" mode (skipping the duplicate check)', () => {
    const { validFiles } = processNewFiles([mockFileA], [existingFileA], {
      ...defaultOptions,
      multiple: false
    });

    expect(validFiles).toHaveLength(1);
    expect(mockValidateFile).toHaveBeenCalledTimes(1);
  });
});

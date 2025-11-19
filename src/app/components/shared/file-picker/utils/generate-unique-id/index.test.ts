import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateUniqueId } from './';
import type { FileMetadata } from '../../types';

const MOCK_TIME = 1600000000000;
const MOCK_FILE_NAME = 'image.png';
const MOCK_FILE_SIZE = 50000;
const MOCK_RANDOM_VALUE = 0.5;
const mockFile = new File(['content'], MOCK_FILE_NAME, {
  lastModified: MOCK_TIME
});

Object.defineProperty(mockFile, 'size', {
  value: MOCK_FILE_SIZE,
  writable: true
});

describe('generateUniqueId', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(MOCK_RANDOM_VALUE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a composite ID using name, lastModified, size, and a random suffix', () => {
    const generatedId = generateUniqueId(mockFile);

    expect(generatedId).toContain(
      `${MOCK_FILE_NAME}-${MOCK_TIME}-${MOCK_FILE_SIZE}`
    );

    expect(generatedId.length).toBeGreaterThan(
      MOCK_FILE_NAME.length +
        String(MOCK_TIME).length +
        String(MOCK_FILE_SIZE).length +
        1
    );

    expect(Math.random).toHaveBeenCalledTimes(1);
  });

  it('should return the existing ID if the object is FileMetadata', () => {
    const EXISTING_ID = 'db-id-555';
    const metadata: FileMetadata = {
      id: EXISTING_ID,
      name: 'db.jpg',
      size: 8,
      src: '',
      type: 'image'
    };

    const returnedId = generateUniqueId(metadata);

    expect(returnedId).toBe(EXISTING_ID);
    expect(Math.random).not.toHaveBeenCalled();
  });
});

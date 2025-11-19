import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createCloudinaryThumbnail } from './';

const { mockCld, mockToURL, mockFormat, mockQuality, mockResize } = vi.hoisted(
  () => {
    const mockToURL = vi.fn(() => 'FINAL_CLOUDINARY_URL');
    const mockQuality = vi.fn().mockReturnThis();
    const mockFormat = vi.fn().mockReturnThis();
    const mockResize = vi.fn().mockReturnThis();

    const mockImageInstance = {
      resize: mockResize,
      format: mockFormat,
      quality: mockQuality,
      toURL: mockToURL
    };

    const mockCld = {
      image: vi.fn(() => mockImageInstance)
    };

    return {
      mockCld,
      mockToURL,
      mockQuality,
      mockFormat,
      mockResize
    };
  }
);

vi.mock('@/app/config/cloudinary', () => ({
  cld: mockCld
}));

vi.mock('@cloudinary/url-gen/actions/resize', () => ({
  thumbnail: vi.fn(() => ({
    width: vi.fn().mockReturnThis(),
    height: vi.fn().mockReturnThis(),
    gravity: vi.fn().mockReturnThis()
  }))
}));

vi.mock('@cloudinary/url-gen/qualifiers/textAlignment', () => ({
  center: vi.fn(() => 'center-gravity')
}));

describe('createCloudinaryThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TEST_PUBLIC_ID = 'products/sku-12345';
  const TEST_OPTIONS = { width: 300, height: 200, quality: 95 };

  it('must call the SDK with the correct resizing and quality parameters', () => {
    const url = createCloudinaryThumbnail(TEST_PUBLIC_ID, TEST_OPTIONS);

    expect(url).toBe('FINAL_CLOUDINARY_URL');
    expect(mockToURL).toHaveBeenCalledTimes(1);
    expect(mockCld.image).toHaveBeenCalledWith(TEST_PUBLIC_ID);
    expect(mockResize).toHaveBeenCalledTimes(1);
    expect(mockFormat).toHaveBeenCalledWith('auto');
    expect(mockQuality).toHaveBeenCalledWith(95);
  });

  it('should use quality 80 if it is not provided', () => {
    const optionsWithoutQuality = { width: 100, height: 100 };

    createCloudinaryThumbnail(TEST_PUBLIC_ID, optionsWithoutQuality);

    expect(mockQuality).toHaveBeenCalledWith(80);
  });

  it('should return an empty string if the publicId is null or starts with "mock"', () => {
    expect(createCloudinaryThumbnail('', TEST_OPTIONS)).toBe('');
    expect(createCloudinaryThumbnail('mock-temp-id', TEST_OPTIONS)).toBe('');
    expect(mockCld.image).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCloudinaryThumbnail } from './';

vi.mock('@/app/config/cloudinary', async () => {
  const { Cloudinary } = await import('@cloudinary/url-gen');
  return {
    cld: new Cloudinary({
      cloud: { cloudName: 'demo-env' },
      url: { secure: true }
    })
  };
});

describe('createCloudinaryThumbnail (Integration)', () => {
  const TEST_PUBLIC_ID = 'products/shirt-blue';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a valid Cloudinary URL with correct transformations', () => {
    const options = { width: 300, height: 400, quality: 90 };

    const url = createCloudinaryThumbnail(TEST_PUBLIC_ID, options);

    expect(url).toContain('https://res.cloudinary.com/demo-env/image/upload/');
    expect(url).toContain('c_thumb');
    expect(url).toContain('g_center');
    expect(url).toContain('h_400');
    expect(url).toContain('w_300');
    expect(url).toContain('f_auto');
    expect(url).toContain('q_90');
    expect(url).toContain(TEST_PUBLIC_ID);
  });

  it('should use default quality (80) when not provided', () => {
    const url = createCloudinaryThumbnail(TEST_PUBLIC_ID, {
      width: 100,
      height: 100
    });

    expect(url).toContain('q_80');
  });

  it('should return empty string for invalid inputs', () => {
    expect(createCloudinaryThumbnail('', { width: 100, height: 100 })).toBe('');
    expect(createCloudinaryThumbnail(null, { width: 100, height: 100 })).toBe(
      ''
    );
    expect(
      createCloudinaryThumbnail(undefined, { width: 100, height: 100 })
    ).toBe('');
  });
});

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance
} from 'vitest';
import { uploadImageToCloudinary } from './index';

function createFile(name: string, type: string, size: number): File {
  const file = new File([''], name, { type });

  Object.defineProperty(file, 'size', { value: size });

  return file;
}

describe('Image Upload Service', () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should upload an image successfully and return mapped data', async () => {
    const mockResponse = {
      public_id: 'sample_id',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      width: 100,
      height: 100
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const file = createFile('test.png', 'image/png', 1024);
    const result = await uploadImageToCloudinary(file);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, options] = fetchSpy.mock.calls[0];

    expect(url).toContain('api.cloudinary.com');
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(FormData);

    expect(result).toEqual({
      publicId: 'sample_id',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
    });
  });

  it('should throw an error when Cloudinary returns an API error', async () => {
    const errorResponse = {
      error: { message: 'Invalid file type' }
    };

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse
    } as Response);

    const file = createFile('bad.exe', 'application/x-msdownload', 1024);

    await expect(uploadImageToCloudinary(file)).rejects.toThrow(
      'Falha no upload: Invalid file type'
    );
  });

  it('should throw a generic error when fetch fails (network error)', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network Error'));

    const file = createFile('test.png', 'image/png', 1024);

    await expect(uploadImageToCloudinary(file)).rejects.toThrow(
      'Falha no upload: Network Error'
    );
  });
});

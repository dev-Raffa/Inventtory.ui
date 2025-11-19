import { vi, describe, it, expect, beforeEach } from 'vitest';
import { uploadImageToCloudinary } from './';

const {
  mockAxiosPost,
  mockFormDataAppend,
  MockFormDataClass,
  mockFormDataConstructor
} = vi.hoisted(() => {
  const mockAxiosPost = vi.fn();
  const mockFormDataAppend = vi.fn();
  const mockFormDataConstructor = vi.fn();

  const MockFormDataClass = class {
    constructor() {
      mockFormDataConstructor();
    }

    append = mockFormDataAppend;
  };

  return {
    mockAxiosPost,
    mockFormDataAppend,
    MockFormDataClass,
    mockFormDataConstructor
  };
});

vi.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
    isAxiosError: vi.fn((error) => !!error.isAxiosError)
  },
  isAxiosError: vi.fn((error) => !!error.isAxiosError)
}));

vi.stubGlobal('FormData', MockFormDataClass);

const MOCK_CLOUD_NAME = 'test-cloud';
const MOCK_UPLOAD_PRESET = 'test-preset';

describe('uploadImageToCloudinary', () => {
  const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('import.meta.env', {
      VITE_CLOUDINARY_NAME: MOCK_CLOUD_NAME,
      VITE_CLOUDINARY_PRESET_NAME: MOCK_UPLOAD_PRESET
    });
  });

  it('must format the FormData and return the publicId and URL on successful entry', async () => {
    const mockResponse = {
      data: {
        public_id: 'test_public_id_123',
        secure_url: 'https://cdn.example.com/image.jpg'
      }
    };
    mockAxiosPost.mockResolvedValueOnce(mockResponse);

    const result = await uploadImageToCloudinary(mockFile);

    expect(mockFormDataConstructor).toHaveBeenCalledTimes(1);
    expect(mockFormDataAppend).toHaveBeenCalledWith('file', mockFile);
    expect(mockFormDataAppend).toHaveBeenCalledWith(
      'upload_preset',
      'invento.ui_unsigned'
    );

    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(MockFormDataClass)
    );

    expect(result).toEqual({
      publicId: 'test_public_id_123',
      url: 'https://cdn.example.com/image.jpg'
    });
  });

  it('should throw a detailed error if the Cloudinary API returns an upload failure', async () => {
    const serverErrorMessage = 'File size is too large.';
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          error: { message: serverErrorMessage }
        }
      },
      message: 'Request failed with status code 400'
    };

    mockAxiosPost.mockRejectedValueOnce(mockError);

    await expect(uploadImageToCloudinary(mockFile)).rejects.toThrow(
      `Falha no upload: ${serverErrorMessage}`
    );
  });

  it('should throw a generic error if the failure is network-related (no response from the server)', async () => {
    const genericAxiosMessage = 'Network Error';
    const mockNetworkError = new Error(genericAxiosMessage);

    (mockNetworkError as any).isAxiosError = true;
    (mockNetworkError as any).response = undefined;

    mockAxiosPost.mockRejectedValueOnce(mockNetworkError);

    await expect(uploadImageToCloudinary(mockFile)).rejects.toThrow(
      `Erro de rede ou upload: ${genericAxiosMessage}`
    );
  });

  it('should throw an unknown error if the error is not an instance of AxiosError or Error', async () => {
    const unknownError = { name: 'CustomError', stack: '...' };

    mockAxiosPost.mockRejectedValueOnce(unknownError);

    await expect(uploadImageToCloudinary(mockFile)).rejects.toThrow(
      'Erro de rede ou upload desconhecido'
    );
  });
});

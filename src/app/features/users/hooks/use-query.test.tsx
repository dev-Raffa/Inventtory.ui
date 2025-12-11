import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useUserProfileQuery,
  useUpdateAvatarMutation,
  useUpdatePasswordMutation,
  USERS_KEYS
} from './use-query';
import { UserService } from '../services';
import { uploadImageToCloudinary } from '@/app/services/image-upload';
import { getCroppedImg } from '@/lib/utils';

vi.mock('../services', () => ({
  UserService: {
    getProfile: vi.fn(),
    updateAvatar: vi.fn(),
    updatePassword: vi.fn()
  }
}));

vi.mock('@/app/services/image-upload', () => ({
  uploadImageToCloudinary: vi.fn()
}));

vi.mock('@/lib/utils', () => ({
  getCroppedImg: vi.fn()
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Users React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserProfileQuery', () => {
    it('should not fetch profile when userId is undefined', async () => {
      const { result } = renderHook(() => useUserProfileQuery(undefined), {
        wrapper: createWrapper()
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(UserService.getProfile).not.toHaveBeenCalled();
    });

    it('should fetch profile when userId is provided', async () => {
      const mockUser = { id: '123', fullName: 'John Doe' };
      vi.mocked(UserService.getProfile).mockResolvedValue(mockUser as any);

      const { result } = renderHook(() => useUserProfileQuery('123'), {
        wrapper: createWrapper()
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(UserService.getProfile).toHaveBeenCalledWith('123');
      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe('useUpdateAvatarMutation', () => {
    it('should successfully orchestrate the crop, upload and update sequence', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' }) as File;
      const mockUrl = 'https://cloudinary.com/avatar.jpg';
      const wrapper = createWrapper();

      vi.mocked(getCroppedImg).mockResolvedValue(mockBlob);
      vi.mocked(uploadImageToCloudinary).mockResolvedValue({
        url: mockUrl
      } as any);

      vi.mocked(UserService.updateAvatar).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper
      });

      await result.current.mutateAsync({
        userId: '123',
        imageSrc: 'blob:source',
        pixelCrop: { x: 0, y: 0, width: 100, height: 100 }
      });

      expect(getCroppedImg).toHaveBeenCalledWith(
        'blob:source',
        expect.any(Object)
      );

      expect(uploadImageToCloudinary).toHaveBeenCalledWith(mockBlob);
      expect(UserService.updateAvatar).toHaveBeenCalledWith('123', mockUrl);
    });

    it('should throw error if cropping fails', async () => {
      vi.mocked(getCroppedImg).mockResolvedValue(null);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper
      });

      await expect(
        result.current.mutateAsync({
          userId: '123',
          imageSrc: 'blob:source',
          pixelCrop: { x: 0, y: 0, width: 100, height: 100 }
        })
      ).rejects.toThrow('Não foi possível processar o recorte da imagem.');

      expect(uploadImageToCloudinary).not.toHaveBeenCalled();
      expect(UserService.updateAvatar).not.toHaveBeenCalled();
    });

    it('should invalidate specific queries on success', async () => {
      const queryClient = new QueryClient();
      const spyInvalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      vi.mocked(getCroppedImg).mockResolvedValue(new Blob() as File);
      vi.mocked(uploadImageToCloudinary).mockResolvedValue({
        url: 'url'
      } as any);

      vi.mocked(UserService.updateAvatar).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper: customWrapper
      });

      await result.current.mutateAsync({
        userId: '123',
        imageSrc: 'blob:source',
        pixelCrop: { x: 0, y: 0, width: 100, height: 100 }
      });

      expect(spyInvalidate).toHaveBeenCalledWith({
        queryKey: USERS_KEYS.profile('123')
      });

      expect(spyInvalidate).toHaveBeenCalledWith({
        queryKey: ['auth']
      });
    });
  });

  describe('useUpdatePasswordMutation', () => {
    it('should call UserService.updatePassword with correct arguments', async () => {
      vi.mocked(UserService.updatePassword).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdatePasswordMutation(), {
        wrapper
      });

      await result.current.mutateAsync('NewPass123!');

      expect(UserService.updatePassword).toHaveBeenCalledWith(
        'NewPass123!',
        expect.anything()
      );
    });
  });
});

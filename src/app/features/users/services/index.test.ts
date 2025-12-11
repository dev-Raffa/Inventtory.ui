import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './index';
import type { UserProfileDTO } from '../types';

const {
  mockSupabase,
  mockSelect,
  mockEq,
  mockUpdate,
  mockUpdateUser,
  mockOverrideTypes
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockOverrideTypes = vi.fn();

  const queryBuilder = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    update: mockUpdate,
    overrideTypes: mockOverrideTypes
  };

  mockSelect.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder);
  mockSingle.mockReturnValue(queryBuilder);
  mockUpdate.mockReturnValue(queryBuilder);

  return {
    mockSupabase: {
      from: vi.fn(() => queryBuilder),
      auth: {
        updateUser: mockUpdateUser
      }
    },
    mockSelect,
    mockEq,
    mockSingle,
    mockUpdate,
    mockUpdateUser,
    mockOverrideTypes
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    const userId = 'user-123';

    it('should return mapped user when profile exists', async () => {
      const mockDTO: UserProfileDTO = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Test User',
        organization_id: 'org-1',
        organizations: { name: 'Org 1' }
      };

      mockOverrideTypes.mockResolvedValue({
        data: mockDTO,
        error: null
      });

      const result = await UserService.getProfile(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          authId: userId,
          fullName: 'Test User'
        })
      );
    });

    it('should return null when profile is not found (PGRST116)', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      const result = await UserService.getProfile(userId);

      expect(result).toBeNull();
    });

    it('should return null if data is null but no error returned', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await UserService.getProfile(userId);

      expect(result).toBeNull();
    });

    it('should throw handled error for other database errors', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'DB Error' }
      });

      await expect(UserService.getProfile(userId)).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar os dados do usuário.'
      );
    });
  });

  describe('updateAvatar', () => {
    const userId = 'user-123';
    const newAvatarUrl = 'http://new.avatar.url';

    it('should update avatar url successfully', async () => {
      mockEq.mockResolvedValue({ error: null });

      await UserService.updateAvatar(userId, newAvatarUrl);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: newAvatarUrl });
      expect(mockEq).toHaveBeenCalledWith('id', userId);
    });

    it('should throw handled error when update fails', async () => {
      mockEq.mockResolvedValue({
        error: { code: '42501', message: 'Permission denied', details: '' }
      });

      await expect(
        UserService.updateAvatar(userId, newAvatarUrl)
      ).rejects.toThrow('Você não tem permissão para realizar esta alteração.');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockUpdateUser.mockResolvedValue({ error: null });

      await UserService.updatePassword('new-password');

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'new-password'
      });
    });

    it('should throw handled error when auth update fails', async () => {
      mockUpdateUser.mockResolvedValue({
        error: new Error('Weak password')
      });

      await expect(UserService.updatePassword('123')).rejects.toThrow(
        'Weak password'
      );
    });
  });
});

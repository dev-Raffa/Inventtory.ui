import { describe, it, expect } from 'vitest';
import { UserMapper } from './mappers';
import type { UserProfileDTO } from '../types';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain model correctly including organization name', () => {
      const dto: UserProfileDTO = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        organization_id: 'org-456',
        organizations: {
          name: 'Acme Corp'
        }
      };
      const authId = 'auth-789';

      const result = UserMapper.toDomain(dto, authId);

      expect(result).toEqual({
        id: 'user-123',
        authId: 'auth-789',
        email: 'test@example.com',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        organizationId: 'org-456',
        organizationName: 'Acme Corp'
      });
    });

    it('should handle missing organization relation gracefully', () => {
      const dto: UserProfileDTO = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'John Doe',
        organization_id: 'org-456',
        organizations: null
      };
      const authId = 'auth-789';

      const result = UserMapper.toDomain(dto, authId);

      expect(result.organizationName).toBeUndefined();
      expect(result.avatarUrl).toBeUndefined();
    });
  });
});

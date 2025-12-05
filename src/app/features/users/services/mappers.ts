import type { User, UserProfileDTO } from '../types';

export const UserMapper = {
  toDomain(dto: UserProfileDTO, authId: string): User {
    return {
      id: dto.id,
      authId: authId,
      email: dto.email,
      fullName: dto.full_name,
      avatarUrl: dto.avatar_url,
      organizationId: dto.organization_id,
      organizationName: dto.organizations?.name
    };
  }
};

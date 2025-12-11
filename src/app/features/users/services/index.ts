import { supabase } from '@/app/config/supabase';
import { handleUserError } from './error-handler';
import { UserMapper } from './mappers';
import type { User, UserProfileDTO } from '../types';

const SELECT_PROFILE_QUERY = `
  id,
  email,
  full_name,
  avatar_url,
  organization_id,
  organizations ( name )
`;

async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(SELECT_PROFILE_QUERY)
    .eq('id', userId)
    .single()
    .overrideTypes<UserProfileDTO, { merge: false }>();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    return handleUserError(error, 'getProfile');
  }

  if (!data) return null;

  return UserMapper.toDomain(data, userId);
}

async function updateAvatar(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) handleUserError(error, 'updateAvatar');
}

async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) handleUserError(error, 'updatePassword');
}

export const UserService = {
  getProfile,
  updateAvatar,
  updatePassword
};

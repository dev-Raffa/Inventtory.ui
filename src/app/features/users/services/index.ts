import { supabase } from '@/app/config/supabase';
import type { User, UserProfileDTO } from '../types';
import { UserMapper } from './mappers';

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
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  if (!data) return null;

  return UserMapper.toDomain(data, userId);
}

async function updateAvatar(userId: string, avatarUrl: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    throw new Error('Erro ao atualizar a imagem de perfil.');
  }
}

async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    throw new Error('Não foi possível atualizar a senha. Tente novamente.');
  }
}

export const UserService = {
  getProfile,
  updateAvatar,
  updatePassword
};

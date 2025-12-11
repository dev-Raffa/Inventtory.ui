import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services';
import type { User } from '../types';
import { uploadImageToCloudinary } from '@/app/services/image-upload';
import { getCroppedImg, type PixelCrop } from '@/lib/utils';

export const USERS_KEYS = {
  all: ['users'] as const,
  profile: (id: string | undefined) =>
    [...USERS_KEYS.all, 'profile', id] as const
};

export function useUserProfileQuery(userId: string | undefined) {
  return useQuery<User | null, Error>({
    queryKey: USERS_KEYS.profile(userId),
    queryFn: async () => {
      if (!userId) return null;

      return UserService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10
  });
}

type UpdateAvatarVariables = {
  userId: string;
  imageSrc: string;
  pixelCrop: PixelCrop;
};

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['users', 'update-avatar'],

    mutationFn: async ({
      userId,
      imageSrc,
      pixelCrop
    }: UpdateAvatarVariables) => {
      const croppedFile = await getCroppedImg(imageSrc, pixelCrop);

      if (!croppedFile) {
        throw new Error('Não foi possível processar o recorte da imagem.');
      }

      const { url } = await uploadImageToCloudinary(croppedFile);

      return UserService.updateAvatar(userId, url);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: USERS_KEYS.profile(variables.userId)
      });

      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },

    meta: {
      successMessage: 'Seu avatar foi atualizado com sucesso!'
    }
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationKey: ['users', 'update-password'],
    mutationFn: UserService.updatePassword,
    meta: {
      successMessage: 'Sua senha foi atualizada com sucesso!'
    }
  });
}

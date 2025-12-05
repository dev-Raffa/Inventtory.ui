import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { UserService } from '@/app/features/users/services';
import { uploadImageToCloudinary } from '@/app/services/image-upload';
import type { FileWithPreview } from '@/app/components/shared/file-picker/types';
import { useAuth } from '@/app/features/auth/hooks/use-auth';
import { getCroppedImg, type PixelCrop } from '@/lib/utils';

type UseAvatarChangeProps = {
  onSuccess?: () => void;
};

export function useAvatarChange({ onSuccess }: UseAvatarChangeProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null
  );

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const reset = () => {
    setFiles([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = async () => {
    if (!user) return;

    if (files.length === 0 || !croppedAreaPixels) {
      toast.error('Selecione e ajuste a imagem.');
      return;
    }

    try {
      setIsSubmitting(true);

      const croppedFile = await getCroppedImg(files[0].src, croppedAreaPixels);

      if (!croppedFile) {
        throw new Error('Falha ao processar a imagem.');
      }

      const { url } = await uploadImageToCloudinary(croppedFile);

      await UserService.updateAvatar(user.id, url);

      toast.success('Avatar atualizado!');

      reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.error('Erro ao atualizar avatar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    files,
    setFiles,
    crop,
    setCrop,
    zoom,
    setZoom,
    onCropComplete,
    isSubmitting,
    handleSave,
    reset,
    userAvatar: user?.avatarUrl
  };
}

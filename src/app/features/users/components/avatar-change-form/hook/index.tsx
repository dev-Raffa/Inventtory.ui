import { useState, useCallback } from 'react';
import type { FileWithPreview } from '@/app/components/shared/file-picker/types';
import { type PixelCrop } from '@/lib/utils';
import { useUser } from '../../../hooks/use-user';
import { useUpdateAvatarMutation } from '../../../hooks/use-query';

type UseAvatarChangeProps = {
  onSuccess?: () => void;
};

export function useAvatarChange({ onSuccess }: UseAvatarChangeProps) {
  const { user } = useUser();

  const { mutate, isPending } = useUpdateAvatarMutation();

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null
  );

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const reset = () => {
    setFiles([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = () => {
    if (!user || files.length === 0 || !croppedAreaPixels) return;

    mutate(
      {
        userId: user.id,
        imageSrc: files[0].src,
        pixelCrop: croppedAreaPixels
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        }
      }
    );
  };

  return {
    files,
    setFiles,
    crop,
    setCrop,
    zoom,
    setZoom,
    onCropComplete,
    isSubmitting: isPending,
    handleSave,
    reset,
    userAvatar: user?.avatarUrl
  };
}

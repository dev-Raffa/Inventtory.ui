import { CloudinaryMapper } from './mapper';
import type { CloudinaryUploadDTO, UploadedImage } from './types';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadImageToCloudinary(
  file: File
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Erro HTTP: ${response.status}`
      );
    }

    const data = (await response.json()) as CloudinaryUploadDTO;

    return CloudinaryMapper.toDomain(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Falha no upload: ${error.message}`);
    }

    throw new Error('Erro desconhecido no upload de imagem');
  }
}

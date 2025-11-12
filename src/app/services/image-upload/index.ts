import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadImageToCloudinary(
  file: File
): Promise<{ publicId: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(UPLOAD_URL, formData);

    return {
      publicId: response.data.public_id,
      url: response.data.secure_url
    };
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Falha no upload: ${error.response.data?.error?.message || error.message}`
      );
    }

    if (error instanceof Error) {
      throw new Error(`Erro de rede ou upload: ${error.message}`);
    }

    throw new Error('Erro de rede ou upload desconhecido');
  }
}

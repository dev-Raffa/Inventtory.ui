import type { CloudinaryUploadDTO, UploadedImage } from './types';

export const CloudinaryMapper = {
  toDomain(dto: CloudinaryUploadDTO): UploadedImage {
    return {
      publicId: dto.public_id,
      url: dto.secure_url
    };
  }
};

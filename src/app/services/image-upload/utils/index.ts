import { cld } from '@/app/config/cloudinary';
import { thumbnail } from '@cloudinary/url-gen/actions/resize';
import { center } from '@cloudinary/url-gen/qualifiers/textAlignment';
interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

export function createCloudinaryThumbnail(
  publicId: string,
  options: ThumbnailOptions
): string {
  if (!publicId) {
    return '';
  }

  const { width, height, quality = 80 } = options;
  const myImage = cld.image(publicId);

  myImage
    .resize(thumbnail().width(width).height(height).gravity(center()))
    .format('auto')
    .quality(quality);

  return myImage.toURL();
}

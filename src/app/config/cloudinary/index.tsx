import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;

if (!cloudName) {
  console.error(
    'VITE_CLOUDINARY_NAME não está definido no .env. As URLs de imagem podem não funcionar.'
  );
}

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
});

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/components/ui/avatar';
import type { IProduct } from '@/app/features/products/types';
import { createCloudinaryThumbnail } from '@/app/services/image-upload/utils';

type TProductTableColumnImage = {
  productId?: string;
  images: IProduct['allImages'];
};

export function ProductTableColumnImages({
  productId,
  images
}: TProductTableColumnImage) {
  return (
    <div className="*:data-[slot=avatar]:ring-background w-32 flex -space-x-2 *:data-[slot=avatar]:ring-2">
      {images?.map(
        (image, index) =>
          index < 2 && (
            <Avatar key={`${productId}-${image.id}`}>
              <AvatarImage
                src={
                  createCloudinaryThumbnail(image.publicId, {
                    height: 150,
                    width: 150,
                    quality: 90
                  }) || 'https://github.com/shadcn.png'
                }
                alt={image.name || '@shadcn'}
                className="object-cover"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          )
      )}
      {images && images.length > 2 && (
        <Avatar>
          <AvatarFallback> + {images.length - 2}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
